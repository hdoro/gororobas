'use server'

import {
	newImagesMutation,
	newSourcesMutation,
	newTipsMutation,
	newVarietiesMutation,
	newVegetableFriendshipsMutation,
	newVegetableMutation,
} from '@/mutations'
import { StoredImage, Vegetable, type VegetableForDB } from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { generateId } from '@/utils/ids'
import { slugify } from '@/utils/strings'
import { Schema } from '@effect/schema'
import * as S from '@effect/schema/Schema'
import type { Client } from 'edgedb'
import { Effect, pipe } from 'effect'
import { formatVegetableFriendForDB } from './formatVegetableFriendForDB'

export async function createVegetable(
	input: VegetableForDB,
	inputClient: Client,
) {
	return runServerEffect(
		Effect.gen(function* (_) {
			if (!Schema.is(Vegetable)(input)) {
				return false
			}

			return yield* pipe(
				Effect.tryPromise({
					try: () => getTransaction(input, inputClient),
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
			await newSourcesMutation.run(tx, {
				sources: allSources,
			})
		}

		// #2 CREATE ALL PHOTOS
		const allPhotos = [
			...(input.varieties || []).flatMap((v) => v?.photos || []),
			...(input.photos || []),
		].flatMap((photo) => {
			if (!S.is(StoredImage)(photo.data)) return []

			return {
				id: photo.id,
				label: photo.label || '',
				sanity_id: photo.data.sanity_id,
				sources: photo.sources?.map((s) => s.id) || [],
			}
		})

		if (allPhotos.length > 0) {
			// @TODO: upload images to Sanity
			await newImagesMutation.run(tx, {
				images: allPhotos,
			})
		}

		// #2 CREATE ALL VARIETIES
		const varieties = (input.varieties || []).map((v) => {
			return {
				id: v.id,
				names: v.names,
				handle: `${input.handle}-${slugify(v.names[0])}`,
				photos: (v.photos || []).flatMap((photo) => {
					// @TODO: better way to lock IDs, probably when decoding the input
					const photoId = allPhotos.find(
						(p) =>
							p.label === photo.label ||
							(S.is(StoredImage)(photo.data) &&
								p.sanity_id === photo.data.sanity_id),
					)?.id
					if (!photoId) return []

					return photoId
				}),
			}
		})

		if (varieties.length > 0) {
			await newVarietiesMutation.run(tx, {
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
			await newTipsMutation.run(tx, {
				tips,
			})
		}

		// #4 Create vegetable
		await newVegetableMutation.run(tx, {
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
			photos: (input.photos || []).flatMap((photo) => {
				// @TODO: better way to lock IDs, probably when decoding the input
				const photoId = allPhotos.find(
					(p) =>
						p.label === photo.label ||
						(S.is(StoredImage)(photo.data) &&
							p.sanity_id === photo.data.sanity_id),
				)?.id
				if (!photoId) return []

				return photoId
			}),
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

		// #5 Create friendships
		if (input.friends && input.friends.length > 0) {
			await newVegetableFriendshipsMutation.run(tx, {
				friends: input.friends.map((friend_id) =>
					formatVegetableFriendForDB(friend_id, input.id),
				),
				vegetable_id: input.id,
			})
		}
	})
}
