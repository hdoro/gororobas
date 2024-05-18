'use server'

import { auth } from '@/edgedb'
import type { VegetableForDB } from '@/schemas'
import { createVegetable } from './createVegetable.implementation'

export async function createVegetableAction(input: VegetableForDB) {
	const session = auth.getSession()

	return createVegetable(input, session.client)
}
