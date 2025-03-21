import { updateNote } from '@/actions/updateNote'
import e from '@/edgeql'
import type { RichTextValue } from '@/schemas'
import { runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import createClient from 'gel'

/**
 * Run updateNote for all notes with current and updated being the same. This should update the content_plain_text field.
 */
async function run() {
  const client = createClient({
    // Note: when developing locally you will need to set tls security to
    // insecure, because the development server uses self-signed certificates
    // which will cause api calls with the fetch api to fail.
    tlsSecurity:
      process.env.NODE_ENV === 'development' ? 'insecure' : 'default',
    instanceName: process.env.EDGEDB_INSTANCE as string,
  }).withConfig({
    apply_access_policies: false,
  })

  await runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () =>
          e
            .select(e.Note, (note) => ({
              ...e.Note['*'],
              filter: e.op(note.content_plain_text, '=', ''),
            }))
            .run(client),
        catch: (error) => new Error(String(error)),
      }),
      Effect.tap(Effect.log),
      Effect.flatMap((notes) =>
        Effect.all(
          notes.map((note) => {
            const typed = {
              ...note,
              title: note.title as RichTextValue,
              body: note.body as RichTextValue,
            }
            return updateNote({ current: typed, updated: typed }, client)
          }),
          { concurrency: 4 },
        ),
      ),
    ),
  )
}

run()
