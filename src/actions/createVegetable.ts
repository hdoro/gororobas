import {
	insertVegetableMutationV2,
	type PhotosMutationInput,
	type SourcesMutationInput,
} from '@/mutations'
import {
	StoredImageData,
	VegetableData,
	type SourceForDB,
	type VegetableForDB,
} from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { InvalidInputError } from '@/types/errors'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { getStandardHandle, paths } from '@/utils/urls'
import { Schema } from '@effect/schema'
import type { Client } from 'edgedb'
import { Effect, pipe } from 'effect'
import { writeFileSync } from 'node:fs'

export function createVegetable(input: VegetableForDB, client: Client) {
	return runServerEffect(
		Effect.gen(function* (_) {
			if (!Schema.is(VegetableData)(input)) {
				return yield* Effect.fail(new InvalidInputError(input, VegetableData))
			}

			return yield* pipe(
				Effect.tryPromise({
					try: () => getTransaction(input, client),
					catch: (error) => {
						console.log('Failed creating vegetable', error)
						return error
					},
				}),
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

	writeFileSync('query.edgeql', insertVegetableMutationV2.toEdgeQL())
	return insertVegetableMutationV2.run(client, {
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
	})
}
