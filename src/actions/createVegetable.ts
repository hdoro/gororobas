import { writeFileSync } from 'node:fs'
import {
	type PhotosMutationInput,
	type SourcesMutationInput,
	insertVegetableMutation,
	upsertVegetableFriendshipsMutation,
} from '@/mutations'
import {
	type SourceForDB,
	StoredImageData,
	VegetableData,
	type VegetableForDB,
} from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { InvalidInputError, UnknownEdgeDBError } from '@/types/errors'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { getStandardHandle, paths } from '@/utils/urls'
import { Schema } from '@effect/schema'
import type { Client } from 'edgedb'
import { Effect, pipe } from 'effect'
import { formatVegetableFriendForDB } from './formatVegetableFriendForDB'

export function createVegetable(input: VegetableForDB, client: Client) {
	return runServerEffect(
		Effect.gen(function* (_) {
			if (!Schema.is(VegetableData)(input)) {
				return yield* Effect.fail(new InvalidInputError(input, VegetableData))
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

function sourcesToParam(
	sources: readonly SourceForDB[] | undefined | null,
): SourcesMutationInput {
	return (sources || []).map((source, sourceIndex) => ({
		id: source.id,
		type: source.type,
		order_index: sourceIndex,
		optional_properties: {
			comments: source.comments,
			credits: 'credits' in source ? source.credits : null,
			origin: 'origin' in source ? source.origin : null,
			users: 'userIds' in source ? source.userIds : null,
		},
	}))
}

function photosToParam(
	photos: readonly (typeof StoredImageData.Type)[] | undefined | null,
): PhotosMutationInput {
	return (photos || []).map((photo, photoIndex) => ({
		id: photo.id,
		order_index: photoIndex,
		sanity_id: photo.data.sanity_id,
		sources: sourcesToParam(photo.sources),
		optional_properties: {
			label: photo.label,
			hotspot: photo.data.hotspot,
			crop: photo.data.crop,
		},
	}))
}

function getTransaction(input: VegetableForDB, inputClient: Client) {
	const client = inputClient.withConfig({ allow_user_specified_id: true })

	writeFileSync('query.edgeql', insertVegetableMutation.toEdgeQL())
	const formattedInput = {
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
		sources: sourcesToParam(input.sources),
		photos: photosToParam(
			(input.photos || []).flatMap((photo) => {
				if (Schema.is(StoredImageData)(photo)) return photo

				return []
			}),
		),
		tips: (input.tips || []).map((tip, tipIndex) => ({
			id: tip.id,
			order_index: tipIndex,
			handle:
				tip.handle ||
				getStandardHandle(
					tiptapJSONtoPlainText(tip.content) || String(tipIndex),
					tip.id,
				),
			subjects: tip.subjects,
			content: tip.content,
			sources: (tip.sources || []).map((source, sourceIndex) => ({
				id: source.id,
				type: source.type,
				order_index: sourceIndex,
				optional_properties: {
					comments: source.comments,
					credits: 'credits' in source ? source.credits : null,
					origin: 'origin' in source ? source.origin : null,
					users: 'userIds' in source ? source.userIds : null,
				},
			})),
		})),
		varieties: (input.varieties || []).map((variety, varietyIndex) => ({
			id: variety.id,
			order_index: varietyIndex,
			names: variety.names,
			handle:
				variety.handle ||
				getStandardHandle(variety.names.join('-'), variety.id),
			photos: photosToParam(
				(variety.photos || []).flatMap((photo) => {
					if (Schema.is(StoredImageData)(photo)) return photo

					return []
				}),
			),
		})),
	} satisfies Parameters<typeof insertVegetableMutation.run>[1]
	writeFileSync(
		'formattedInput-auto.json',
		JSON.stringify(formattedInput, null, 2),
	)

	return client.transaction(async (tx) => {
		const createdVegetable = await insertVegetableMutation.run(
			tx,
			formattedInput,
		)
		const friendships = await upsertVegetableFriendshipsMutation.run(tx, {
			vegetable_id: input.id,
			friends: (input.friends || []).map((friend_id) =>
				formatVegetableFriendForDB(friend_id, input.id),
			),
		})

		return {
			vegetable_id: createdVegetable.id,
			friendships,
		}
	})
}
