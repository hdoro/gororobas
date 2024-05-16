'use server'

import { auth } from '@/edgedb'
import { vegetablesForReferenceQuery } from '@/queries'
import type { ReferenceOption } from '@/types'

export type ReferenceObjectType = 'Vegetable'

export async function listPossibleReferences(
	// @TODO: handle objectType when adding users
	_objectType: ReferenceObjectType,
): Promise<ReferenceOption[] | { error: string }> {
	const session = auth.getSession()

	try {
		const vegetables = await vegetablesForReferenceQuery.run(session.client)
		return vegetables.map(
			(vegetable) =>
				({
					id: vegetable.id,
					label: vegetable.label,
					image: vegetable.photos[0],
				}) satisfies ReferenceOption,
		)
	} catch (error) {
		console.log(error)
		return { error: 'couldnt-fetch' }
	}
}
