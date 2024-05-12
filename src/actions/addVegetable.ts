'use server'

import { auth } from '@/edgedb'
import { Vegetable, type VegetableForDB } from '@/schemas'
import { Schema } from '@effect/schema'
import { createVegetable } from './createVegetable'

export async function addVegetable(vegetableForDb?: VegetableForDB) {
	const session = auth.getSession()

	if (!Schema.is(Vegetable)(vegetableForDb)) {
		return false
	}

	console.time('createVegetable')
	try {
		await createVegetable(vegetableForDb, session.client)
		console.timeEnd('createVegetable')
		return true
	} catch (error) {
		console.timeEnd('createVegetable')
		console.log('ERROR', error)
		return false
	}
}
