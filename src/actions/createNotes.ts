import { insertNotesMutation } from '@/mutations'
import { NoteDataArray, type NotesForDB } from '@/schemas'
import { buildTraceAndMetrics } from '@/services/runtime'
import { UnknownEdgeDBError } from '@/types/errors'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { getStandardHandle } from '@/utils/urls'
import type { Client } from 'edgedb'
import { Effect, Schema, pipe } from 'effect'

export function createNotes(input: NotesForDB, client: Client) {
  return pipe(
    Schema.decodeUnknown(NoteDataArray)(input),
    Effect.flatMap((notes) =>
      Effect.tryPromise({
        try: () => getTransaction(notes, client),
        catch: (error) => {
          console.log('Failed creating notes', error)
          return new UnknownEdgeDBError(error)
        },
      }),
    ),
    ...buildTraceAndMetrics('create_notes', {
      count: input.length,
    }),
  )
}

function getTransaction(input: NotesForDB, inputClient: Client) {
  const client = inputClient.withConfig({ allow_user_specified_id: true })

  return insertNotesMutation.run(client, {
    notes: input.map((note) => ({
      id: note.id,
      handle:
        note.handle ||
        getStandardHandle(
          tiptapJSONtoPlainText(note.title)
            ?.replace(/&amp;/g, 'e')
            // Remove common escaped HTML entities
            ?.replace(
              /&quot;|&lt;|&gt;|&nbsp;|&#39;|&apos;|&cent;|&pound;|&yen;|&euro;|&copy;|&reg;/g,
              '',
            ) || '',
          note.id,
        ),
      title: note.title,
      public: note.public,
      published_at: note.published_at,
      types: note.types,
      optional_properties: {
        body: note.body ?? null,
        created_by: note.created_by ?? null,
      },
    })),
  })
}
