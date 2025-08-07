import { Effect, pipe, Schema } from 'effect'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/gel'
import { noteEditingQuery } from '@/queries'
import { NoteData, type RichTextValue } from '@/schemas'
import { runQuery } from '@/services/runQuery'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { InvalidInputError } from '@/types/errors'
import { paths } from '@/utils/urls'
import EditNoteForm from './EditNoteForm'

function getRouteData(handle: string) {
  return runServerEffect(
    pipe(
      runQuery(
        noteEditingQuery,
        { handle },
        { metricsName: 'note_editing_page', metricsData: { handle } },
      ),
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

export default async function EditNotePage(props: {
  params: Promise<{ handle: string }>
}) {
  const params = await props.params

  const { handle } = params

  const session = await auth.getSession()

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
