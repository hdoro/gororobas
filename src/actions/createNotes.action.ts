'use server'

import { auth } from '@/gel'
import type { NotesForDB } from '@/schemas'
import { runServerEffect } from '@/services/runtime'
import { Effect } from 'effect'
import { createNotes } from './createNotes'

export async function createNotesAction(input: NotesForDB) {
  const session = await auth.getSession()

  return runServerEffect(
    createNotes(input, session.client).pipe(
      Effect.map((result) => ({
        success: true,
        result,
      })),
      Effect.catchAll((error) =>
        Effect.succeed({
          success: false,
          error: error._tag,
        } as const),
      ),
    ),
  )
}
