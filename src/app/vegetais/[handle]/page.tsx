import { auth } from '@/edgedb'
import { vegetablePageQuery } from '@/queries'
import { notFound } from 'next/navigation'
import VegetablePage from './VegetablePage'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'

export default async function VegetableRoute({
	params: { handle },
}: {
	params: { handle: string }
}) {
	const session = auth.getSession()

	const vegetable = await runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => vegetablePageQuery.run(session.client, { handle }),
				catch: (error) => console.log(error),
			}),
			...buildTraceAndMetrics('vegetable_page', { handle }),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)

	if (!vegetable) return notFound()

	return <VegetablePage vegetable={vegetable} />
}
