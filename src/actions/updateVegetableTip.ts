'use server'

import { auth } from '@/gel'
import { currentUserQuery } from '@/queries'
import { VegetableTipData, type VegetableTipForDB } from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import {
  InvalidInputError,
  UnauthorizedError,
  UnknownGelDBError,
} from '@/types/errors'
import { Effect, Schema, pipe } from 'effect'
import { createOrUpdateTipTransaction } from './createOrUpdateTipTransaction'

export async function updateVegetableTipAction(input: {
  tip: VegetableTipForDB
}) {
  const session = await auth.getSession()

  return runServerEffect(
    Effect.gen(function* (_) {
      const userProfile = yield* Effect.promise(() =>
        currentUserQuery.run(session.client),
      )
      if (!userProfile?.id) {
        return yield* Effect.fail(new UnauthorizedError())
      }

      if (
        !Schema.is(Schema.partial(VegetableTipData))(input.tip) ||
        !Schema.is(Schema.UUID)(input.tip.id)
      ) {
        return yield* Effect.fail(
          new InvalidInputError(input, Schema.partial(VegetableTipData)),
        )
      }

      return yield* pipe(
        Effect.tryPromise({
          try: () => createOrUpdateTipTransaction(input, session.client),
          catch: (error) => {
            console.log('Failed updating tip', error)
            return new UnknownGelDBError(error)
          },
        }),
        Effect.map(
          () =>
            ({
              success: true,
            }) as const,
        ),
        ...buildTraceAndMetrics('update_vegetable_tip', {
          tip_id: input.tip.id,
        }),
      ).pipe(
        Effect.catchAll(() =>
          Effect.succeed({
            success: false,
            error: 'erro-desconhecido',
          } as const),
        ),
      )
    }),
  )
}
