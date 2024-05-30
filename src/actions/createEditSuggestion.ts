'use server'

import { auth } from '@/edgedb'
import { insertEditSuggestionMutation } from '@/mutations'
import {
	type ImageData,
	NewImage,
	type VegetableForDB,
	VegetableVarietyData,
} from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { UnknownEdgeDBError } from '@/types/errors'
import { uploadImagesToSanity } from '@/utils/uploadImagesToSanity'
import { paths } from '@/utils/urls'
import { Schema } from '@effect/schema'
import { Effect, pipe } from 'effect'
import { Operation, atomizeChangeset, diff as jsonDiff } from 'json-diff-ts'

/**
 * Thinking through editing vegetables:
 *
 * High-level workflow:
 * - Create an edit suggestion with a diff and snapshot
 * - The diff is in the shape of `json-diff-ts`
 * - Create a dashboard to review suggestions, admin only
 * - Admins can approve or reject suggestions
 * - When approved, the diff is applied to the vegetable
 *
 * Complications:
 * 1. We can't just send the base64 of the images inside of the diff, it'd be too heavy for the DB
 *   	- then we need to upload the images to Sanity first
 * 2. Applying the diff is not trivial
 * 3. Ideally users should be able to see their own edit suggestions
 * 4. Ideally users would be notified when their suggestion is approved or rejected
 *
 * For now, skipping 3. and 4.
 *
 * Implementation:
 * 1. ✅ server action to createEditSuggestion
 * 		1. diffs the current and updated objects
 * 		2. uploads new images in the diff to Sanity
 * 		3. replaces photos with data of `NewImage` with `StoredImage` based on the uploaded data
 * 2. use this routeHandler to replace each photo in the uploaded object with a StoredImage instead
 * 3. diff the objects and create the EditSuggestion
 * 4. find out how to apply EditSuggestion
 *
 *
 * LEARNINGS WITH DIFFS
 * - When I ADD a friend, or any array of primitives, I get ADD, fine
 * - When I DELETE an item from an array of primitives, I get REMOVE, also fine
 * - But when I DELETE an item and add another at the same index, I get UPDATE, which could be tricky for friendships
 * 		- FIND WAY TO DELETE FRIENDSHIPS THAT WERE REMOVED
 * - Changes in arrays are grouped under the `changes` array
 * - Updating photos' meta is working fine
 * - Deleting a photo and uploading another on top changes the ID (via ImageInput), and leads to an ADD
 * - atomizeChangeset will flatten changes
 */

/**
 * 1. diffs the current and updated objects
 * 2. uploads new images in the diff to Sanity
 * 3. replaces photos with data of `NewImage` with `StoredImage` based on the uploaded data
 * 4. diffs the updated vegetable with these `StoredImage`s applied
 * 5. stores the diff in the database
 *
 * This workflow for images avoids us having to store the entire base_64 in the database.
 * As a result, diffs are lighter and actually usable.
 */
export async function createEditSuggestionAction({
	current,
	updated,
}: {
	current: VegetableForDB
	updated: VegetableForDB
}) {
	const diffBeforeImages = diffVegetableForDB({ current, updated })
	const atomicChangesBeforeImages = atomizeChangeset(diffBeforeImages)

	const newImagesToUpload = atomicChangesBeforeImages.flatMap((change) => {
		if (change.type !== Operation.ADD) return []

		const data = change.value?.data
		if (Schema.is(NewImage)(data)) {
			return { id: change.value.id as string, data }
		}

		// When adding new varieties, include all of their photos
		if (Schema.is(VegetableVarietyData)(data)) {
			return (data.photos || []).flatMap((photo) => {
				if (!Schema.is(NewImage)(photo.data)) return []

				return {
					id: photo.id,
					data: photo.data,
				}
			})
		}

		return []
	})

	const uploaded = await uploadImagesToSanity(newImagesToUpload)

	function includeStoredImageInPhoto(
		photo: typeof ImageData.Type,
	): typeof ImageData.Type | [] {
		if (!Schema.is(NewImage)(photo.data)) return photo

		const uploadedData = uploaded[photo.id]
		// @TODO: better handle image errors instead of simply ignoring them
		if (!uploadedData || !('sanity_id' in uploadedData)) return []

		return {
			...photo,
			data: {
				sanity_id: uploadedData.sanity_id,
			},
		}
	}

	const withStoredImages = {
		...updated,
		photos: updated.photos
			? updated.photos.flatMap(includeStoredImageInPhoto)
			: updated.photos,
		varieties: updated.varieties
			? updated.varieties.map((v) => ({
					...v,
					photos: (v.photos || []).flatMap(includeStoredImageInPhoto),
				}))
			: updated.varieties,
	}

	const diffAfterImages = diffVegetableForDB({
		current,
		updated: withStoredImages,
	})

	const session = auth.getSession()

	return runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () =>
					insertEditSuggestionMutation.run(session.client, {
						diff: diffAfterImages,
						target_id: current.id,
						snapshot: current,
					}),
				catch: (error) => new UnknownEdgeDBError(error),
			}),
			Effect.map(
				(createdObject) =>
					({
						success: true,
						redirectTo: paths.editSuggestion(createdObject.id),
						message: {
							title: 'Sugestão de edição enviada',
							description:
								'Recebemos sua sugestão e vamos avaliar em breve - brigadin! 🤗',
						},
					}) as const,
			),
			...buildTraceAndMetrics('insert_edit_suggestion', {
				vegetable_id: current.id,
			}),
		).pipe(
			Effect.catchAll(() =>
				// @TODO: better user-facing errors
				Effect.succeed({ success: false, error: 'unknown' } as const),
			),
		),
	)
}

function diffVegetableForDB({
	current,
	updated,
}: {
	current: VegetableForDB
	updated: VegetableForDB
}) {
	return jsonDiff(current, updated, {
		embeddedObjKeys: {
			photos: 'id',
			sources: 'id',
			varieties: 'id',
			tips: 'id',
			'tips.sources': 'id',
			'varieties.photos': 'id',
		},
	})
}
