'use server'

import { auth } from '@/edgedb'
import { type DeleteNotesInput, deleteNotes } from './deleteNotes'

export async function deleteNotesAction(input: typeof DeleteNotesInput.Type) {
  const session = await auth.getSession()

  return deleteNotes(input, session.client)
}
