import {
  insertVegetableMutation,
  upsertSourcesMutation,
  upsertVegetableFriendshipsMutation,
  upsertVegetableVarietiesMutation,
} from '@/mutations'
import {
  type VegetableForDBWithImages,
  VegetableWithUploadedImages,
} from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { InvalidInputError, UnknownGelDBError } from '@/types/errors'
import {
  photosToReferences,
  referencesInFormToParam,
  sourcesToParam,
  upsertImagesInTransaction,
  varietiesToParam,
} from '@/utils/mutation.utils'
import { paths } from '@/utils/urls'
import { Effect, Schema, pipe } from 'effect'
import type { Client } from 'gel'
import { formatVegetableFriendForDB } from './formatVegetableFriendForDB'

export function createVegetable(
  input: VegetableForDBWithImages,
  client: Client,
) {
  return runServerEffect(
    Effect.gen(function* (_) {
      if (!Schema.is(VegetableWithUploadedImages)(input)) {
        return yield* Effect.fail(
          new InvalidInputError(input, VegetableWithUploadedImages),
        )
      }

      return yield* pipe(
        Effect.tryPromise({
          try: () => getTransaction(input, client),
          catch: (error) => {
            console.log('Failed creating vegetable', error)
            return new UnknownGelDBError(error)
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

function getTransaction(input: VegetableForDBWithImages, inputClient: Client) {
  const client = inputClient.withConfig({ allow_user_specified_id: true })

  return client.transaction(async (tx) => {
    // #1 CREATE ALL SOURCES
    const allSources = [
      ...(input.photos || []).flatMap((photo) => photo?.sources || []),
      ...(input.varieties || []).flatMap(
        (variety) =>
          variety?.photos?.flatMap((photo) => photo?.sources || []) || [],
      ),
      ...(input.sources || []),
    ]
    if (allSources.length > 0) {
      await upsertSourcesMutation.run(tx, sourcesToParam(allSources))
    }

    // #2 CREATE ALL IMAGES
    const allPhotos = [
      ...(input.varieties || []).flatMap((v) => v?.photos || []),
      ...(input.photos || []),
    ]
    const photosIdMap = await upsertImagesInTransaction(allPhotos, tx)

    // #3 CREATE ALL VARIETIES
    if (input.varieties && input.varieties.length > 0) {
      await upsertVegetableVarietiesMutation.run(
        tx,
        varietiesToParam(input.varieties, photosIdMap),
      )
    }

    // #4 CREATE THE VEGETABLE
    const createdVegetable = await insertVegetableMutation.run(tx, {
      id: input.id,
      names: input.names,
      handle: input.handle,
      scientific_names: input.scientific_names ?? null,
      gender: input.gender ?? null,
      strata: input.strata ?? null,
      development_cycle_max: input.development_cycle_max ?? null,
      development_cycle_min: input.development_cycle_min ?? null,
      height_max: input.height_max ?? null,
      height_min: input.height_min ?? null,
      temperature_max: input.temperature_max ?? null,
      temperature_min: input.temperature_min ?? null,
      origin: input.origin ?? null,
      uses: input.uses ?? null,
      planting_methods: input.planting_methods ?? null,
      edible_parts: input.edible_parts ?? null,
      lifecycles: input.lifecycles ?? null,
      content: input.content ?? null,
      photos: photosToReferences(input.photos || [], photosIdMap),
      sources: referencesInFormToParam(input.sources),
      varieties: referencesInFormToParam(input.varieties),
    })

    // #5 CREATE FRIENDSHIPS
    const friendships =
      input.friends && input.friends.length > 0
        ? await upsertVegetableFriendshipsMutation.run(tx, {
            vegetable_id: createdVegetable.id,
            friends: (input.friends || []).map((friend_id) =>
              formatVegetableFriendForDB(friend_id, createdVegetable.id),
            ),
          })
        : []

    return {
      createdVegetable,
      friendships,
    }
  })
}
