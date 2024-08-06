'use server'

import { auth } from '@/edgedb'
import {
  addTipsToVegetableMutation,
  upsertSourcesMutation,
  upsertVegetableTipsMutation,
} from '@/mutations'
import { currentUserQuery } from '@/queries'
import { VegetableTipData, type VegetableTipForDB } from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import {
  InvalidInputError,
  UnauthorizedError,
  UnknownEdgeDBError,
} from '@/types/errors'
import { sourcesToParam, tipsToParam } from '@/utils/mutation.utils'
import { Schema } from '@effect/schema'
import type { Client } from 'edgedb'
import { Effect, pipe } from 'effect'

export async function createVegetableTipAction(input: {
  vegetable_id: string
  tip: VegetableTipForDB
}) {
  const session = auth.getSession()

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
          try: () => createTipTransaction(input, session.client),
          catch: (error) => {
            console.log('Failed creating tip', error)
            return new UnknownEdgeDBError(error)
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
              return new UnknownEdgeDBError(error)
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

function createTipTransaction(
  { tip }: { vegetable_id: string; tip: VegetableTipForDB },
  inputClient: Client,
) {
  const userClient = inputClient.withConfig({ allow_user_specified_id: true })

  return userClient.transaction(async (tx) => {
    // #1 CREATE ALL SOURCES
    const allSources = tip.sources || []
    if (allSources.length > 0) {
      await upsertSourcesMutation.run(tx, sourcesToParam(allSources))
    }

    // #2 CREATE THE TIP
    return await upsertVegetableTipsMutation.run(tx, tipsToParam([tip]))
  })
}
