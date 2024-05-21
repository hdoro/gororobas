'use server'

import { auth } from '@/edgedb'
import { deleteNotes, type DeleteNotesInput } from './deleteNotes'

export async function deleteNotesAction(input: typeof DeleteNotesInput.Type) {
	const session = auth.getSession()

	return deleteNotes(input, session.client)
}
