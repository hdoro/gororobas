'use server'

import { auth } from '@/edgedb'
import type { VegetableWishlistStatus } from '@/edgedb.interfaces'
import { updateWishlistStatusMutation } from '@/mutations'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'

export async function addToWishlist(
  vegetable_id: string,
  wishlist_status: VegetableWishlistStatus,
) {
  const session = auth.getSession()

  return runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () =>
          updateWishlistStatusMutation.run(session.client, {
            vegetable_id,
            status: wishlist_status,
          }),
        catch: (error) => {
          console.log(error)
          return error
        },
      }),
      Effect.map(() => true),
      ...buildTraceAndMetrics('add_to_wishlist', {
        vegetable_id,
        wishlist_status,
      }),
    ).pipe(Effect.catchAll(() => Effect.succeed(false))),
  )
}
