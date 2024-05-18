import { auth } from '@/edgedb'
import { userWishlistQuery } from '@/queries'
import { Effect } from 'effect'
import WishlistButton, { type WishlistInfo } from './WishlistButton'

const fetchWishlistStatus = (vegetable_id: string) =>
	Effect.gen(function* (_) {
		const isSignedIn = yield* _(
			Effect.tryPromise(() => auth.getSession().isSignedIn()),
		)

		if (!isSignedIn) return { isSignedIn } as const

		const data = yield* _(
			Effect.tryPromise({
				try: () =>
					userWishlistQuery.run(auth.getSession().client, { vegetable_id }),
				catch: (error) => console.log(error),
			}),
		)

		return {
			isSignedIn: true,
			status: data?.status || null,
		} as const
	}).pipe(
		Effect.tapError((error) => Effect.logError(error)),
		Effect.catchAll(() => Effect.succeed({ isSignedIn: false } as const)),
		Effect.withSpan('fetchWishlistStatus', { attributes: { vegetable_id } }),
		Effect.withLogSpan('fetchWishlistStatus'),
	) satisfies Effect.Effect<WishlistInfo>

export default async function WishlistButtonData(props: {
	vegetable_id: string
}) {
	const response = await Effect.runPromise(
		fetchWishlistStatus(props.vegetable_id),
	)

	return <WishlistButton vegetable_id={props.vegetable_id} {...response} />
}
