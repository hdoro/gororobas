import {
	type ReferencesParam,
	insertVegetableMutation,
	upsertImagesMutation,
	upsertSourcesMutation,
	upsertVegetableFriendshipsMutation,
	upsertVegetableTipsMutation,
	upsertVegetableVarietiesMutation,
} from '@/mutations'
import {
	type ImageObjectInDB,
	type SourceForDB,
	type SourceInForm,
	type VegetableForDB,
	type VegetableTipForDB,
	type VegetableVarietyForDB,
	VegetableWithUploadedImages,
} from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { InvalidInputError, UnknownEdgeDBError } from '@/types/errors'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { getStandardHandle, paths } from '@/utils/urls'
import { Schema } from '@effect/schema'
import type { Client } from 'edgedb'
import { Effect, pipe } from 'effect'
import type { DeepMutable } from 'effect/Types'
import { formatVegetableFriendForDB } from './formatVegetableFriendForDB'

export function createVegetable(input: VegetableForDB, client: Client) {
	return runServerEffect(
		Effect.gen(function* (_) {
			if (!Schema.is(VegetableWithUploadedImages)(input)) {
				return yield* Effect.fail(
					new InvalidInputError(input, VegetableWithUploadedImages),
				)
			}

			console.log('RUNNING')
			return yield* pipe(
				Effect.tryPromise({
					try: () => getTransaction(input, client),
					catch: (error) => {
						console.log('Failed creating vegetable', error)
						return new UnknownEdgeDBError(error)
					},
				}),
				Effect.tap(Effect.logInfo),
				Effect.map(
					() =>
						({
							success: true,
							redirectTo: paths.vegetable(input.handle),
						}) as const,
				),
				...buildTraceAndMetrics('create_vegetable', {
					vegetable_id: input.id,
				}),
			).pipe(
				Effect.catchAll(() =>
					Effect.succeed({
						success: false,
						// @TODO better handle error so users know what went wrong
						error: 'erro-desconhecido',
					} as const),
				),
			)
		}),
	)
}

type UpsertSourcesMutationParams = Parameters<
	typeof upsertSourcesMutation.run
>[1]

function sourcesToParam(
	input: readonly SourceForDB[] | undefined | null,
): UpsertSourcesMutationParams {
	const sources = input || []

	return sources.reduce(
		(params, source, sourceIndex) => {
			// If there are duplicates, give preference to the last ones in the array
			if (sources.slice(sourceIndex + 1).some((s) => s.id === source.id))
				return params

			params.sources.push({
				id: source.id,
				type: source.type,
				optional_properties: {
					comments: source.comments,
					credits: 'credits' in source ? source.credits : null,
					origin: 'origin' in source ? source.origin : null,
					users: 'userIds' in source ? source.userIds : null,
				},
			})

			return params
		},
		{
			sources: [],
		} as DeepMutable<UpsertSourcesMutationParams>,
	)
}

type UpsertImagesMutationParams = Parameters<typeof upsertImagesMutation.run>[1]

function photosToParam(
	input: readonly (typeof ImageObjectInDB.Type)[] | undefined | null,
): UpsertImagesMutationParams {
	const images = input || []

	return images.reduce(
		(params, image, imageIndex) => {
			// If there are duplicates, give preference to the last ones in the array
			if (images.slice(imageIndex + 1).some((i) => i.id === image.id))
				return params

			params.images.push({
				id: image.id,
				sanity_id: image.sanity_id,
				sources: referencesInFormToParam(image.sources),
				optional_properties: {
					label: image.label,
					hotspot: image.hotspot,
					crop: image.crop,
				},
			})

			return params
		},
		{
			images: [],
		} as DeepMutable<UpsertImagesMutationParams>,
	)
}

type UpsertVegetableTipsMutationParams = Parameters<
	typeof upsertVegetableTipsMutation.run
>[1]

function tipsToParam(
	input: readonly VegetableTipForDB[] | undefined | null,
): UpsertVegetableTipsMutationParams {
	const tips = input || []

	return tips.reduce(
		(params, tip, tipIndex) => {
			// If there are duplicates, give preference to the last ones in the array
			if (tips.slice(tipIndex + 1).some((t) => t.id === tip.id)) return params

			params.tips.push({
				id: tip.id,
				content: tip.content,
				subjects: tip.subjects as DeepMutable<typeof tip.subjects>,
				sources: referencesInFormToParam(tip.sources),
				handle:
					tip.handle ||
					getStandardHandle(
						tiptapJSONtoPlainText(tip.content) || String(tipIndex),
						tip.id,
					),
			})

			return params
		},
		{
			tips: [],
		} as DeepMutable<UpsertVegetableTipsMutationParams>,
	)
}

type UpsertVegetableVarietiesMutationParams = Parameters<
	typeof upsertVegetableVarietiesMutation.run
>[1]

function varietiesToParam(
	input: readonly VegetableVarietyForDB[] | undefined | null,
	photosIdMap: Record<string, string>,
): UpsertVegetableVarietiesMutationParams {
	const varieties = input || []

	return varieties.reduce(
		(params, variety, tipIndex) => {
			// If there are duplicates, give preference to the last ones in the array
			if (varieties.slice(tipIndex + 1).some((t) => t.id === variety.id))
				return params

			params.varieties.push({
				id: variety.id,
				names: variety.names as unknown as string[],
				handle:
					variety.handle ||
					getStandardHandle(variety.names.join('-'), variety.id),
				photos: photosToReferences(variety.photos || [], photosIdMap),
			})

			return params
		},
		{
			varieties: [],
		} as DeepMutable<UpsertVegetableVarietiesMutationParams>,
	)
}

function getTransaction(input: VegetableForDB, inputClient: Client) {
	const client = inputClient.withConfig({ allow_user_specified_id: true })

	return client.transaction(async (tx) => {
		// #1 CREATE ALL SOURCES
		const allSources = [
			...(input.tips || []).flatMap((tip) => tip?.sources || []),
			...(input.photos || []).flatMap((photo) => photo?.sources || []),
			...(input.varieties || []).flatMap(
				(variety) =>
					variety?.photos?.flatMap((photo) => photo?.sources || []) || [],
			),
			...(input.sources || []),
		]

		await upsertSourcesMutation.run(tx, sourcesToParam(allSources))

		// #2 CREATE ALL IMAGES
		const allPhotos = [
			...(input.varieties || []).flatMap((v) => v?.photos || []),
			...(input.photos || []),
		]
		const uniquePhotos = allPhotos.filter((photo, photoIndex, allPhotos) => {
			// If there are duplicates, give preference to the last ones in the array
			const hasDuplicate = allPhotos
				.slice(photoIndex + 1)
				.some((i) => i.id === photo.id || i.sanity_id === photo.sanity_id)

			return !hasDuplicate
		})
		const upsertedImages = await upsertImagesMutation.run(
			tx,
			photosToParam(uniquePhotos),
		)
		/** As photos with duplicate sanity_id are removed in the upserted `uniquePhotos` above, we need to  */
		const photosIdMap = Object.fromEntries(
			allPhotos.map((photo) => {
				const upsertedImage = upsertedImages.find(
					(i) => i.id === photo.id || i.sanity_id === photo.sanity_id,
				)
				if (!upsertedImage) {
					throw new Error(
						`Image wasn't uploaded: ${photo.id}\nAborting transaction.`,
					)
				}
				return [photo.id, upsertedImage.id]
			}),
		)

		// #3 CREATE ALL TIPS
		await upsertVegetableTipsMutation.run(tx, tipsToParam(input.tips))

		// #4 CREATE ALL VARIETIES
		await upsertVegetableVarietiesMutation.run(
			tx,
			varietiesToParam(input.varieties, photosIdMap),
		)

		// #5 CREATE THE VEGETABLE
		const createdVegetable = await insertVegetableMutation.run(tx, {
			names: input.names,
			handle: input.handle,
			scientific_names: input.scientific_names ?? null,
			gender: input.gender ?? null,
			strata: input.strata ?? null,
			temperature_max: input.temperature_max ?? null,
			temperature_min: input.temperature_min ?? null,
			height_max: input.height_max ?? null,
			height_min: input.height_min ?? null,
			origin: input.origin ?? null,
			uses: input.uses ?? null,
			planting_methods: input.planting_methods ?? null,
			edible_parts: input.edible_parts ?? null,
			lifecycles: input.lifecycles ?? null,
			content: input.content ?? null,
			photos: photosToReferences(input.photos || [], photosIdMap),
			sources: referencesInFormToParam(input.sources),
			tips: referencesInFormToParam(input.tips),
			varieties: referencesInFormToParam(input.varieties),
		})

		// #6 CREATE FRIENDSHIPS
		const friendships = await upsertVegetableFriendshipsMutation.run(tx, {
			vegetable_id: createdVegetable.id,
			friends: (input.friends || []).map((friend_id) =>
				formatVegetableFriendForDB(friend_id, createdVegetable.id),
			),
		})

		return {
			createdVegetable,
			friendships,
		}
	})
}

function referencesInFormToParam(
	references:
		| Readonly<Pick<typeof SourceInForm.Type, 'id'>[]>
		| undefined
		| null,
): DeepMutable<ReferencesParam> {
	return (references || []).map((reference, order_index) => {
		return {
			id: reference.id,
			order_index,
		}
	})
}

function photosToReferences(
	photos: Readonly<(typeof ImageObjectInDB.Type)[]> | undefined,
	photosIdMap: Record<string, string>,
): DeepMutable<ReferencesParam> {
	return referencesInFormToParam(
		(photos || []).map((photo) => ({
			id: photosIdMap[photo.id],
		})),
	)
}
