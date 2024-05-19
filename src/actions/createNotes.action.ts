'use server'

import { auth } from '@/edgedb'
import type { NotesForDB } from '@/schemas'
import { runServerEffect } from '@/services/runtime'
import { createNotes } from './createNotes'

export async function createNotesAction(input: NotesForDB) {
	const session = auth.getSession()

	return runServerEffect(createNotes(input, session.client))
}
