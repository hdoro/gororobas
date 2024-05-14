'use server'

import { auth } from '@/edgedb'
import type { VegetableWishlistStatus } from '@/edgedb.interfaces'
import { setWishlistStatusMutation } from '@/mutations'

export async function addToWishlist(
	vegetable_id: string,
	wishlist_status: VegetableWishlistStatus,
) {
	const session = auth.getSession()

	console.time('addToWishlist')
	try {
		await setWishlistStatusMutation.run(session.client, {
			vegetable_id,
			status: wishlist_status,
		})
		console.timeEnd('addToWishlist')
		return true
	} catch (error) {
		console.timeEnd('addToWishlist')
		console.log('ERROR', error)
		return false
	}
}
