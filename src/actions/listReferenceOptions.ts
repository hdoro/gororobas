'use server'

import { auth } from '@/edgedb'
import {
  profilesForReferenceQuery,
  vegetablesForReferenceQuery,
} from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import type { ReferenceOption } from '@/types'
import { Effect, pipe } from 'effect'

export type ReferenceObjectType = 'Vegetable' | 'UserProfile'

export async function listReferenceOptions(
  objectType: ReferenceObjectType,
): Promise<ReferenceOption[] | { error: string }> {
  const session = await auth.getSession()

  let fetcher: Effect.Effect<ReferenceOption[], unknown, never> = pipe(
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
          }) satisfies ReferenceOption,
      ),
    ),
  )

  if (objectType === 'UserProfile') {
    fetcher = pipe(
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
            }) satisfies ReferenceOption,
        ),
      ),
    )
  }

  return runServerEffect(
    pipe(
      fetcher,
      ...buildTraceAndMetrics('list_reference_options', { objectType }),
    ).pipe(
      Effect.catchAll(() =>
        Effect.succeed({
          error: 'couldnt-fetch',
        } as const),
      ),
    ),
  )
}
