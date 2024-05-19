import {
	insertImagesMutation,
	insertSourcesMutation,
	insertTipsMutation,
	insertVarietiesMutation,
	insertVegetableFriendshipsMutation,
	insertVegetableMutation,
} from '@/mutations'
import { StoredImage, Vegetable, type VegetableForDB } from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { generateId } from '@/utils/ids'
import { slugify } from '@/utils/strings'
import { uploadImagesToSanity } from '@/utils/uploadImagesToSanity'
import { Schema } from '@effect/schema'
import * as S from '@effect/schema/Schema'
import type { Client } from 'edgedb'
import { Effect, pipe } from 'effect'
import { formatVegetableFriendForDB } from './formatVegetableFriendForDB'

export function createVegetable(input: VegetableForDB, client: Client) {
	return runServerEffect(
		Effect.gen(function* (_) {
			if (!Schema.is(Vegetable)(input)) {
				return false
			}

			return yield* pipe(
				Effect.tryPromise({
					try: () => getTransaction(input, client),
					catch: (error) => {
						console.log('Failed creating vegetable', error)
					},
				}),
				...buildTraceAndMetrics('create_vegetable', {
					vegetable_id: input.id,
				}),
				Effect.map(() => true),
				Effect.catchAll(() => Effect.succeed(false)),
			)
		}),
	)
}
function getTransaction(input: VegetableForDB, inputClient: Client) {
	const client = inputClient.withConfig({ allow_user_specified_id: true })

	return client.transaction(async (tx) => {
		// #1 CREATE ALL SOURCES
		const allSources = [
			...(input.tips || []).flatMap((tip) => tip?.sources || []),
			...(input.photos || []).flatMap((photo) => photo?.sources || []),
			...(input.sources || []),
		]
		if (allSources.length > 0) {
			await insertSourcesMutation.run(tx, {
				sources: allSources,
			})
		}

		// #2 CREATE ALL PHOTOS
		const allPhotos = [
			...(input.varieties || []).flatMap((v) => v?.photos || []),
			...(input.photos || []),
		]
		let photosWithIds: {
			id: string
			label: string
			sanity_id: string
			sources: string[]
		}[] = []
		if (allPhotos.length > 0) {
			const uploaded = await uploadImagesToSanity(allPhotos)
			const allPhotosFormatted = [
				...(input.varieties || []).flatMap((v) => v?.photos || []),
				...(input.photos || []),
			].flatMap((photo) => {
				if (S.is(StoredImage)(photo.data)) {
					return {
						id: photo.id,
						label: photo.label || '',
						sanity_id: photo.data.sanity_id,
						sources: photo.sources?.map((s) => s.id) || [],
					}
				}

				const result = uploaded[photo.id]
				const sanity_id =
					result && 'sanity_id' in result ? result.sanity_id : null
				if (!sanity_id) return [] // @TODO better handle image errors

				return {
					id: photo.id,
					label: photo.label || '',
					sanity_id,
					sources: photo.sources?.map((s) => s.id) || [],
				}
			})

			if (allPhotosFormatted.length > 0) {
				const imagesRes = await insertImagesMutation.run(tx, {
					images: allPhotosFormatted,
				})
				console.log('IMAGESRES \n\n\n\n', imagesRes)
			}

			photosWithIds = allPhotosFormatted
		}

		console.log('\n\n\n\nphotosWithIds', photosWithIds)
		// #2 CREATE ALL VARIETIES
		const varieties = (input.varieties || []).map((v) => {
			return {
				id: v.id,
				names: v.names,
				handle: `${input.handle}-${slugify(v.names[0])}`,
				photosSanityId: (v.photos || []).flatMap((photo) => {
					const photoSanityId = photosWithIds.find(
						(p) => p.id === photo.id,
					)?.sanity_id
					if (!photoSanityId) return []

					return photoSanityId
				}),
			}
		})

		if (varieties.length > 0) {
			await insertVarietiesMutation.run(tx, {
				varieties,
			})
		}

		// #3 Create all tips
		const tips = (input.tips || []).map(
			({ subjects, content, sources, id }) => {
				return {
					id,
					content,
					subjects,
					handle: `${input.handle}-${generateId()}`,
					content_links: [],
					sources: sources?.map((s) => s.id) || [],
				}
			},
		)
		if (tips.length > 0) {
			await insertTipsMutation.run(tx, {
				tips,
			})
		}

		// #4 Create vegetable
		await insertVegetableMutation.run(tx, {
			id: input.id,
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
			photos: (input.photos || [])
				.flatMap((photo) => {
					const photoSanityId = photosWithIds.find(
						(p) => p.id === photo.id,
					)?.sanity_id
					if (!photoSanityId) return []

					return photoSanityId
				})
				.map((sanity_id, order_index) => ({
					sanity_id,
					order_index,
				})),
			varieties: varieties.map((variety, order_index) => ({
				id: variety.id,
				order_index,
			})),
			tips: tips.map((tip, order_index) => ({
				id: tip.id,
				order_index,
			})),
			sources: input.sources?.map((s) => s.id) || [],
		})
		console.log('\n\n\n\nprocessed', {
			input: input.photos,
			plainMap: (input.photos || []).map((photo) => {
				const photoId = photosWithIds.find((p) => p.id === photo.id)?.id
				return photoId
			}),
			processed: (input.photos || [])
				.flatMap((photo) => {
					const photoId = photosWithIds.find((p) => p.id === photo.id)?.id
					if (!photoId) return []

					return photoId
				})
				.map((id, order_index) => ({
					id,
					order_index,
				})),
		})

		// #5 Create friendships
		if (input.friends && input.friends.length > 0) {
			await insertVegetableFriendshipsMutation.run(tx, {
				friends: input.friends.map((friend_id) =>
					formatVegetableFriendForDB(friend_id, input.id),
				),
				vegetable_id: input.id,
			})
		}
	})
}
