import { Effect, pipe, Schema } from 'effect'
import type { Client } from 'gel'
import { insertNotesMutation } from '@/mutations'
import { NoteDataArray, type NoteInForm, type NotesForDB } from '@/schemas'
import { buildTraceAndMetrics } from '@/services/runtime'
import { UnknownGelDBError } from '@/types/errors'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { getStandardHandle } from '@/utils/urls'

export function createNotes(input: NotesForDB, client: Client) {
  return pipe(
    Schema.decodeUnknown(NoteDataArray)(input),
    Effect.flatMap((notes) =>
      Effect.tryPromise({
        try: () => getTransaction(notes, client),
        catch: (error) => {
          console.log('[createNotes] failed creating notes', error)
          return new UnknownGelDBError(error)
        },
      }),
    ),
    ...buildTraceAndMetrics('create_notes', {
      count: input.length,
    }),
  )
}

export function getNotePlainText(note: NoteInForm) {
  return [
    tiptapJSONtoPlainText(note.title),
    !!note.body && tiptapJSONtoPlainText(note.body),
  ]
    .filter(Boolean)
    .join(' ')
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
      public: note.public ?? true,
      publish_status: note.publish_status ?? 'PRIVATE',
      published_at: note.published_at,
      types: note.types,
      content_plain_text: getNotePlainText(note),
      optional_properties: {
        body: note.body ?? null,
        created_by: note.created_by ?? null,
      },
    })),
  })
}
