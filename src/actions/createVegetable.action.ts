'use server'

import { auth } from '@/edgedb'
import type { VegetableForDBWithImages } from '@/schemas'
import { createVegetable } from './createVegetable'

export async function createVegetableAction(input: VegetableForDBWithImages) {
	const session = auth.getSession()

	return createVegetable(input, session.client)
}
