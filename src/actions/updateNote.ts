import { updateNotesMutation } from '@/mutations'
import { NoteData, type NoteInForm } from '@/schemas'
import { buildTraceAndMetrics } from '@/services/runtime'
import { UnknownEdgeDBError } from '@/types/errors'
import type { Client } from 'edgedb'
import { Schema } from 'effect'
import { Effect, pipe } from 'effect'

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
            optional_properties: updated,
          }),
        catch: (error) => {
          console.log('Failed creating notes', error)
          return new UnknownEdgeDBError(error)
        },
      }),
    ),
    ...buildTraceAndMetrics('update_note'),
  )
}
