import { auth } from '@/edgedb'
import { notePageQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { truncate } from '@/utils/strings'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { pathToAbsUrl, paths } from '@/utils/urls'
import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import NotePage from './NotePage'

function getRouteData(handle: string) {
	const session = auth.getSession()

	return runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => notePageQuery.run(session.client, { handle }),
				catch: (error) => console.log(error),
			}),
			...buildTraceAndMetrics('note_page', { handle }),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)
}

export async function generateMetadata({
	params,
}: {
	params: { handle: string }
}): Promise<Metadata> {
	const note = await getRouteData(params.handle)

	const title = note?.title ? tiptapJSONtoPlainText(note.title) : undefined

	if (!note || !title)
		return {
			title: 'Nota não encontrada no Gororobas',
		}

	const body = note.body ? tiptapJSONtoPlainText(note.body) : undefined
	return {
		title: `${truncate(title, 60)} | Gororobas`,
		description: `Enviada por ${truncate(
			note.created_by?.name || 'alguém',
			20,
		)} em ${new Date(note.published_at).toLocaleDateString('pt-BR', {})}.${
			body ? `\n\n${truncate(body, 120)}` : ''
		}`,
		openGraph: {
			url: pathToAbsUrl(paths.note(note.handle)),
		},
	}
}

export default async function NoteRoute({
	params: { handle },
}: {
	params: { handle: string }
}) {
	const note = await getRouteData(handle)

	if (!note) return notFound()

	return <NotePage note={note} />
}
