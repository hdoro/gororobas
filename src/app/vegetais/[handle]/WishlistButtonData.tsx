import { auth } from '@/edgedb'
import type { VegetableWishlistStatus } from '@/edgedb.interfaces'
import { userWishlistQuery } from '@/queries'
import WishlistButton from './WishlistButton'

export default async function WishlistButtonData(props: {
	vegetable_id: string
}) {
	const session = auth.getSession()
	const isSignedIn = await session.isSignedIn()

	let status: VegetableWishlistStatus | null = null
	if (isSignedIn) {
		const data = await userWishlistQuery.run(session.client, {
			vegetable_id: props.vegetable_id,
		})
		if (data?.status) status = data?.status
	}

	return <WishlistButton vegetable_id={props.vegetable_id} status={status} />
}
