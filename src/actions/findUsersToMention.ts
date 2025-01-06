'use server'

import { auth } from '@/edgedb'
import { findUsersToMentionQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'

export async function findUsersToMention(query: string) {
  const session = await auth.getSession()

  return runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () =>
          findUsersToMentionQuery.run(session.client, { query: `%${query}%` }),
        catch: (error) => {
          console.log('Failed finding users to mention', error)
        },
      }),
      ...buildTraceAndMetrics('find_users_to_mention'),
      Effect.catchAll(() =>
        Effect.succeed({
          error: 'no-mention',
        } as const),
      ),
    ),
  )
}
