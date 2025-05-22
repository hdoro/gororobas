'use server'

import { auth } from '@/gel'
import { addTipsToVegetableMutation } from '@/mutations'
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

export async function createVegetableTipAction(input: {
  vegetable_id: string
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
        !Schema.is(VegetableTipData)(input.tip) ||
        !Schema.is(Schema.UUID)(input.vegetable_id)
      ) {
        return yield* Effect.fail(
          new InvalidInputError(input, VegetableTipData),
        )
      }

      return yield* pipe(
        Effect.tryPromise({
          // Create the tip with the user's session to include correct Auditable data
          try: () => createOrUpdateTipTransaction(input, session.client),
          catch: (error) => {
            console.log('[createVegetableTip] failed creating tip', error)
            return new UnknownGelDBError(error)
          },
        }),
        // ADD THE TIP TO THE VEGETABLE
        Effect.flatMap((createdTips) => {
          // As modifying a vegetable requires admin privileges, we're executing it as an admin
          const userClient = session.client.withConfig({
            allow_user_specified_id: true,
            apply_access_policies: false,
          })

          return Effect.tryPromise({
            try: () =>
              addTipsToVegetableMutation.run(userClient, {
                vegetable_id: input.vegetable_id,
                tips: createdTips.map((tip) => tip.id),
              }),
            catch: (error) => {
              console.log('Failed adding tip to vegetable', error)
              return new UnknownGelDBError(error)
            },
          })
        }),
        Effect.map(
          () =>
            ({
              success: true,
            }) as const,
        ),
        ...buildTraceAndMetrics('create_vegetable_tip', {
          vegetable_id: input.vegetable_id,
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
