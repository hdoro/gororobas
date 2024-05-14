'use server'

import { auth } from '@/edgedb'
import { findUsersToMentionQuery } from '@/queries'

export async function findUsersToMention(query: string) {
	const session = auth.getSession()

	try {
		return await findUsersToMentionQuery.run(session.client, {
			query: `%${query}%`,
		})
	} catch (error) {
		console.log(error)
		return { error: 'no-mention' }
	}
}
