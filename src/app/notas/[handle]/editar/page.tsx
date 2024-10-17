import { auth } from '@/edgedb'
import { noteEditingQuery } from '@/queries'
import { NoteData, type RichTextValue } from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { InvalidInputError } from '@/types/errors'
import { paths } from '@/utils/urls'
import { Schema } from '@effect/schema'
import { Effect, pipe } from 'effect'
import { notFound, redirect } from 'next/navigation'
import EditNoteForm from './EditNoteForm'

function getRouteData(handle: string) {
  const session = auth.getSession()

  return runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => noteEditingQuery.run(session.client, { handle }),
        catch: (error) => console.log(error),
      }),
      Effect.flatMap((note) => {
        if (!note) return Effect.fail(new InvalidInputError(note, NoteData))

        return Effect.succeed({
          ...note,
          title: note.title as RichTextValue,
          body: note.body as RichTextValue,
        })
      }),
      ...buildTraceAndMetrics('note_editing_page', { handle }),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )
}

export default async function EditNotePage({
  params: { handle },
}: {
  params: { handle: string }
}) {
  const session = auth.getSession()

  if (!(await session.isSignedIn())) {
    redirect(paths.signInOrSignUp(paths.editNote(handle)))
  }

  const noteForDB = await getRouteData(handle)

  if (!noteForDB) return notFound()

  const noteInForm = await pipe(
    Schema.encode(NoteData)(noteForDB),
    Effect.runPromise,
  )

  return <EditNoteForm noteForDB={noteForDB} noteInForm={noteInForm} />
}
