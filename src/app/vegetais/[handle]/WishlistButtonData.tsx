import { auth } from '@/edgedb'
import { userWishlistQuery } from '@/queries'
import { runQuery } from '@/services/runQuery'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect } from 'effect'
import WishlistButton, { type WishlistInfo } from './WishlistButton'

const fetchWishlistStatus = (vegetable_id: string) =>
  Effect.gen(function* (_) {
    const isSignedIn = yield* _(
      Effect.tryPromise(async () => (await auth.getSession()).isSignedIn()),
    )

    if (!isSignedIn) return { isSignedIn } as const

    const data = yield* _(
      runQuery(
        userWishlistQuery,
        { vegetable_id },
        {
          metricsName: 'vegetable-wishlist-status',
          metricsData: { vegetable_id },
        },
      ),
    )

    return {
      isSignedIn: true,
      status: data?.status ?? null,
    } as const
  }).pipe(
    ...buildTraceAndMetrics('fetch_wishlist_status', { vegetable_id }),
    Effect.tapError((error) => Effect.logError(error)),
    Effect.catchAll(() => Effect.succeed({ isSignedIn: false } as const)),
  ) satisfies Effect.Effect<WishlistInfo>

export default async function WishlistButtonData(props: {
  vegetable_id: string
}) {
  const response = await runServerEffect(
    fetchWishlistStatus(props.vegetable_id),
  )

  return <WishlistButton vegetable_id={props.vegetable_id} {...response} />
}
