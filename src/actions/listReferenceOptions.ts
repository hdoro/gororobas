'use server'

import { auth } from '@/gel'
import {
  profilesForReferenceQuery,
  vegetablesForReferenceQuery,
} from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import type { ReferenceObjectType, ReferenceOption } from '@/types'
import { Effect, pipe } from 'effect'

export async function listReferenceOptions(
  objectTypes: ReferenceObjectType[],
): Promise<ReferenceOption[] | { error: string }> {
  const session = await auth.getSession()

  const vegetableFetcher: Effect.Effect<ReferenceOption[], unknown, never> =
    pipe(
      Effect.tryPromise({
        try: () => vegetablesForReferenceQuery.run(session.client),
        catch: (error) => {
          console.log('Failed listing reference options', error)
          return error
        },
      }),
      Effect.map((vegetables) =>
        vegetables.map(
          (vegetable) =>
            ({
              id: vegetable.id,
              label: vegetable.label,
              image: vegetable.photos[0],
              objectType: 'Vegetable',
            }) satisfies ReferenceOption,
        ),
      ),
    )

  const userProfileFetcher = pipe(
    Effect.tryPromise({
      try: () => profilesForReferenceQuery.run(session.client),
      catch: (error) => {
        console.log('Failed listing reference options', error)
        return error
      },
    }),
    Effect.map((profiles) =>
      profiles.map(
        (profile) =>
          ({
            id: profile.id,
            label: profile.label,
            image: profile.photo,
            objectType: 'UserProfile',
          }) satisfies ReferenceOption,
      ),
    ),
  )

  const fetcher = Effect.all(
    [
      ...(objectTypes.includes('UserProfile') ? [userProfileFetcher] : []),
      ...(objectTypes.includes('Vegetable') ? [vegetableFetcher] : []),
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
