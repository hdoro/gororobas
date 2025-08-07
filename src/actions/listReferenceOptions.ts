'use server'

import { Effect, pipe } from 'effect'
import { auth } from '@/gel'
import {
  profilesForReferenceQuery,
  tagsForReferenceQuery,
  vegetablesForReferenceQuery,
} from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import type {
  ReferenceObjectType,
  ReferenceOption,
  ReferenceValueType,
} from '@/types'

export async function listReferenceOptions(
  objectTypes: ReferenceObjectType[],
  valueType: ReferenceValueType = 'id',
): Promise<ReferenceOption[] | { error: string }> {
  const session = await auth.getSession()

  const vegetableFetcher: Effect.Effect<ReferenceOption[], unknown, never> =
    pipe(
      Effect.tryPromise({
        try: () => vegetablesForReferenceQuery.run(session.client),
        catch: (error) => {
          console.log(
            '[listReferenceOptions/vegetableFetcher] failed listing reference options',
            error,
          )
          return error
        },
      }),
      Effect.map((vegetables) =>
        vegetables.map(
          (vegetable) =>
            ({
              value: valueType === 'id' ? vegetable.id : vegetable.handle,
              label: vegetable.label,
              image: vegetable.photos[0],
              keywords: vegetable.keywords,
              objectType: 'Vegetable',
            }) satisfies ReferenceOption,
        ),
      ),
    )

  const userProfileFetcher = pipe(
    Effect.tryPromise({
      try: () => profilesForReferenceQuery.run(session.client),
      catch: (error) => {
        console.log(
          '[listReferenceOptions/userProfileFetcher] failed listing reference options',
          error,
        )
        return error
      },
    }),
    Effect.map((profiles) =>
      profiles.map(
        (profile) =>
          ({
            value: valueType === 'id' ? profile.id : profile.handle,
            label: profile.label,
            image: profile.photo,
            objectType: 'UserProfile',
          }) satisfies ReferenceOption,
      ),
    ),
  )

  const tagFetcher = pipe(
    Effect.tryPromise({
      try: () => tagsForReferenceQuery.run(session.client),
      catch: (error) => {
        console.log(
          '[listReferenceOptions/tagFetcher] failed listing reference options',
          error,
        )
        return error
      },
    }),
    Effect.map((tags) =>
      tags.map(
        (tag) =>
          ({
            value: valueType === 'id' ? tag.id : tag.handle,
            label: tag.label,
            keywords: tag.keywords,
            objectType: 'Tag',
          }) satisfies ReferenceOption,
      ),
    ),
  )

  const fetcher = Effect.all(
    [
      ...(objectTypes.includes('UserProfile') ? [userProfileFetcher] : []),
      ...(objectTypes.includes('Vegetable') ? [vegetableFetcher] : []),
      ...(objectTypes.includes('Tag') ? [tagFetcher] : []),
    ],
    { concurrency: 'unbounded' },
  ).pipe(
    Effect.map((options) => options.flat().filter((option) => !!option.label)),
  )

  return runServerEffect(
    pipe(
      fetcher,
      ...buildTraceAndMetrics('list_reference_options', { objectTypes }),
    ).pipe(
      Effect.catchAll(() =>
        Effect.succeed({
          error: 'couldnt-fetch',
        } as const),
      ),
    ),
  )
}
