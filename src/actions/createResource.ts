import { insertResourceMutation, upsertSourcesMutation } from '@/mutations'
import {
  type ResourceForDBWithImages,
  ResourceWithUploadedImages,
} from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { InvalidInputError, UnknownGelDBError } from '@/types/errors'
import { generateId } from '@/utils/ids'
import {
  referencesInFormToParam,
  sourcesToParam,
  upsertImagesInTransaction,
} from '@/utils/mutation.utils'
import { slugify, truncate } from '@/utils/strings'
import { paths } from '@/utils/urls'
import { Effect, Schema, pipe } from 'effect'
import type { Client } from 'gel'

export function createResource(input: ResourceForDBWithImages, client: Client) {
  return runServerEffect(
    Effect.gen(function* (_) {
      if (!Schema.is(ResourceWithUploadedImages)(input)) {
        return yield* Effect.fail(
          new InvalidInputError(input, ResourceWithUploadedImages),
        )
      }

      return yield* pipe(
        Effect.tryPromise({
          try: () => getTransaction(input, client),
          catch: (error) => {
            console.log('[createResource] failed creating resource', error)
            return new UnknownGelDBError(error)
          },
        }),
        Effect.tap(Effect.logInfo),
        Effect.map(
          ({ handle }) =>
            ({
              success: true,
              redirectTo: paths.resource(handle),
            }) as const,
        ),
        ...buildTraceAndMetrics('create_resource', {
          resource_id: input.id,
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

function getTransaction(input: ResourceForDBWithImages, inputClient: Client) {
  const client = inputClient.withConfig({ allow_user_specified_id: true })

  return client.transaction(async (tx) => {
    // #1 CREATE ALL SOURCES
    const allSources = input.thumbnail?.sources || []
    if (allSources.length > 0) {
      await upsertSourcesMutation.run(tx, sourcesToParam(allSources))
    }

    // #2 CREATE ALL IMAGES
    const allPhotos = input.thumbnail ? [input.thumbnail] : []
    const photosIdMap = await upsertImagesInTransaction(allPhotos, tx)

    const handle = `${slugify(truncate(input.title, 50))}-${generateId().split('-')[0]}`
    // #3 CREATE THE RESOURCE
    const createdResource = await insertResourceMutation.run(tx, {
      title: input.title,
      format: input.format,
      handle: handle,
      url: input.url.toString(),
      description: input.description || null,
      credit_line: input.credit_line || null,
      thumbnail: input.thumbnail?.id ? photosIdMap[input.thumbnail.id] : null,
      tags: referencesInFormToParam(
        (input.tags || []).map((id, index) => ({
          id,
          order_index: index,
        })),
      ),
      related_vegetables: referencesInFormToParam(
        (input.related_vegetables || []).map((id, index) => ({
          id,
          order_index: index,
        })),
      ),
    })

    return {
      createdResource,
      handle,
    }
  })
}
