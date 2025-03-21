import { updateNotesMutation } from '@/mutations'
import { NoteData, type NoteInForm } from '@/schemas'
import { buildTraceAndMetrics } from '@/services/runtime'
import { UnknownGelDBError } from '@/types/errors'
import { Effect, Schema, pipe } from 'effect'
import type { Client } from 'gel'
import { getNotePlainText } from './createNotes'

export function updateNote(
  input: {
    current: NoteInForm
    updated: NoteInForm
  },
  client: Client,
) {
  return pipe(
    Schema.decodeUnknown(
      Schema.Struct({
        current: NoteData,
        updated: NoteData,
      }),
    )(input),
    Effect.flatMap(({ current, updated }) =>
      Effect.tryPromise({
        try: () =>
          updateNotesMutation.run(client, {
            note_id: current.id,
            updated_at: new Date(),
            optional_properties: {
              ...updated,
              content_plain_text: getNotePlainText(updated),
            },
          }),
        catch: (error) => {
          console.log('Failed creating notes', error)
          return new UnknownGelDBError(error)
        },
      }),
    ),
    ...buildTraceAndMetrics('update_note'),
  )
}
