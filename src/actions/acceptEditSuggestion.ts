'use server'

import { auth } from '@/edgedb'
import {
	acceptSuggestionMutation,
	updateVegetableMutation,
	upsertSourcesMutation,
	upsertVegetableFriendshipsMutation,
	upsertVegetableVarietiesMutation,
} from '@/mutations'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import {
	photosToReferences,
	referencesInFormToParam,
	sourcesToParam,
	upsertImagesInTransaction,
	varietiesToParam,
} from '@/utils/mutation.utils'
import { paths } from '@/utils/urls'
import { Schema } from '@effect/schema'
import type { Client } from 'edgedb'
import { Effect, pipe } from 'effect'
import { formatVegetableFriendForDB } from './formatVegetableFriendForDB'
import {
	type EditSuggestionData,
	getEditSuggestionData,
} from './getEditSuggestionData'

export async function acceptEditSuggestionAction({
	suggestion_id,
}: { suggestion_id: string }) {
	if (!Schema.is(Schema.UUID)(suggestion_id)) {
		return {
			success: false,
			error: 'invalid-input',
		} as const
	}

	const session = auth.getSession()

	return runServerEffect(
		pipe(
			getEditSuggestionData(suggestion_id),
			Effect.flatMap((data) =>
				Effect.tryPromise({
					try: () => getTransaction(data, session.client),
					catch: (error) => {
						console.log('Failed applying edit suggestion\n', error)
						return error
					},
				}),
			),
			Effect.map(
				(result) =>
					({
						success: true,
						redirectTo: paths.vegetable(result.handle),
					}) as const,
			),
			...buildTraceAndMetrics('accept_edit_suggestion', {
				suggestion_id,
			}),
		).pipe(
			Effect.catchAll(() =>
				Effect.succeed({
					success: false,
					// @TODO better handle error so users know what went wrong
					error: 'erro-desconhecido',
				} as const),
			),
		),
	)
}

function getTransaction(data: EditSuggestionData, inputClient: Client) {
	const client = inputClient.withConfig({ allow_user_specified_id: true })

	const { dataThatChanged } = data
	const vegetable_id = data.target_object.id
	return client.transaction(async (tx) => {
		// #1 CREATE/MODIFY SOURCES
		const allSources = [
			...(dataThatChanged.photos || []).flatMap(
				(photo) => photo?.sources || [],
			),
			...(dataThatChanged.varieties || []).flatMap(
				(variety) =>
					variety?.photos?.flatMap((photo) => photo?.sources || []) || [],
			),
			...(dataThatChanged.sources || []),
		]
		if (allSources.length > 0) {
			await upsertSourcesMutation.run(tx, sourcesToParam(allSources))
		}

		// #2 CREATE/MODIFY ALL IMAGES
		const allPhotos = [
			...(dataThatChanged.varieties || []).flatMap((v) => v?.photos || []),
			...(dataThatChanged.photos || []),
		]
		const photosIdMap = await upsertImagesInTransaction(allPhotos, tx)

		// #3 CREATE/MODIFY ALL VARIETIES
		if (dataThatChanged.varieties && dataThatChanged.varieties.length > 0) {
			await upsertVegetableVarietiesMutation.run(
				tx,
				varietiesToParam(dataThatChanged.varieties, photosIdMap),
			)
		}

		// #4 MODIFY THE VEGETABLE
		const updatedVegetable = await updateVegetableMutation.run(tx, {
			id: vegetable_id,
			names: dataThatChanged.names ?? null,
			handle: dataThatChanged.handle ?? null,
			scientific_names: dataThatChanged.scientific_names ?? null,
			gender: dataThatChanged.gender ?? null,
			strata: dataThatChanged.strata ?? null,
			development_cycle_max: dataThatChanged.development_cycle_max ?? null,
			development_cycle_min: dataThatChanged.development_cycle_min ?? null,
			height_max: dataThatChanged.height_max ?? null,
			height_min: dataThatChanged.height_min ?? null,
			temperature_max: dataThatChanged.temperature_max ?? null,
			temperature_min: dataThatChanged.temperature_min ?? null,
			origin: dataThatChanged.origin ?? null,
			uses: dataThatChanged.uses ?? null,
			planting_methods: dataThatChanged.planting_methods ?? null,
			edible_parts: dataThatChanged.edible_parts ?? null,
			lifecycles: dataThatChanged.lifecycles ?? null,
			content: dataThatChanged.content ?? null,
			photos: photosToReferences(dataThatChanged.photos || [], photosIdMap),
			sources: referencesInFormToParam(dataThatChanged.sources),
			varieties: referencesInFormToParam(dataThatChanged.varieties),
		})

		// #5 CREATE/MODIFY FRIENDSHIPS
		const updated_friendships =
			dataThatChanged.friends && dataThatChanged.friends.length > 0
				? await upsertVegetableFriendshipsMutation.run(tx, {
						vegetable_id: vegetable_id,
						friends: (dataThatChanged.friends || []).map((friend_id) =>
							formatVegetableFriendForDB(friend_id, vegetable_id),
						),
					})
				: []

		// #6 MODIFY SUGGESTION
		await acceptSuggestionMutation.run(tx, {
			suggestion_id: data.id,
		})

		return {
			updatedVegetable,
			updated_friendships,
			handle: data.toRender.handle,
		}
	})
}
