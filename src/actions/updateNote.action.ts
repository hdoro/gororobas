'use server'

import { auth } from '@/edgedb'
import type { NoteInForm } from '@/schemas'
import { runServerEffect } from '@/services/runtime'
import { Effect } from 'effect'
import { updateNote } from './updateNote'
import { NoteUpdateFailedError } from '@/types/errors'

export async function updateNoteAction(input: {
  current: NoteInForm
  updated: NoteInForm
}) {
  const session = auth.getSession()

  return runServerEffect(
    updateNote(input, session.client).pipe(
      Effect.flatMap((result) =>
        result
          ? Effect.succeed({ success: true, result } as const)
          : Effect.fail(new NoteUpdateFailedError(result, input.current.id)),
      ),
      Effect.catchAll((error) =>
        Effect.succeed({
          success: false,
          error: error._tag,
        } as const),
      ),
    ),
  )
}
