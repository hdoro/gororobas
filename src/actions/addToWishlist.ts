'use server'

import { auth } from '@/edgedb'
import type { VegetableWishlistStatus } from '@/edgedb.interfaces'
import { setWishlistStatusMutation } from '@/mutations'
import { Effect, Metric, pipe } from 'effect'

const timer = Metric.timer('addToWishlist')

export async function addToWishlist(
	vegetable_id: string,
	wishlist_status: VegetableWishlistStatus,
) {
	const session = auth.getSession()

	return pipe(
		Effect.tryPromise({
			try: () =>
				setWishlistStatusMutation.run(session.client, {
					vegetable_id,
					status: wishlist_status,
				}),
			catch: (error) => console.log(error),
		}),
		Effect.map(() => true),
		Effect.tapError((error) => Effect.logError(error)),
		Effect.catchAll(() => Effect.succeed(false)),
		Metric.trackDuration(timer),
		Effect.withSpan('WishlistedBy', { attributes: { vegetable_id } }),
		Effect.withLogSpan('WishlistedBy'),
		Effect.runPromise,
	)
}
