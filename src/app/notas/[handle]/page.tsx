import { auth } from '@/edgedb'
import { notePageQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import { notFound } from 'next/navigation'
import NotePage from './NotePage'

export default async function VegetableRoute({
	params: { handle },
}: {
	params: { handle: string }
}) {
	const session = auth.getSession()

	const note = await runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => notePageQuery.run(session.client, { handle }),
				catch: (error) => console.log(error),
			}),
			...buildTraceAndMetrics('note_page', { handle }),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)

	if (!note) return notFound()

	return <NotePage note={note} />
}
