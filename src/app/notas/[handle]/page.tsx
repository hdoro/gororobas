import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { m } from '@/paraglide/messages'
import { notePageQuery } from '@/queries'
import { runQuery } from '@/services/runQuery'
import { runServerEffect } from '@/services/runtime'
import { truncate } from '@/utils/strings'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { paths, pathToAbsUrl } from '@/utils/urls'
import NotePage from './NotePage'

export function getNoteRouteData(handle: string) {
  return runServerEffect(
    pipe(
      runQuery(
        notePageQuery,
        { handle },
        {
          metricsName: 'note_page',
          metricsData: { handle },
        },
      ),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )
}

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const params = await props.params
  const note = await getNoteRouteData(params.handle)

  const title = note?.title ? tiptapJSONtoPlainText(note.title) : undefined

  if (!note || !title)
    return {
      title: 'Nota não encontrada no Gororobas',
    }

  const body = note.body ? tiptapJSONtoPlainText(note.body) : undefined
  return {
    title: `${truncate(title, 60)} | Gororobas Agroecologia`,
    description:
      m.lazy_simple_swan_push({
        name: truncate(note.created_by?.name || 'alguém', 20),
        date: new Date(note.published_at).toLocaleDateString('pt-BR', {}),
      }) + (body ? `\n\n${truncate(body, 120)}` : ''),
    openGraph: {
      url: pathToAbsUrl(paths.note(note.handle)),
    },
  }
}

export default async function NoteRoute(props: {
  params: Promise<{ handle: string }>
}) {
  const params = await props.params

  const { handle } = params

  const note = await getNoteRouteData(handle)

  if (!note) return notFound()

  return <NotePage note={note} />
}
