import { auth } from '@/edgedb'
import { vegetablePageQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VegetablePage from './VegetablePage'
import getVegetableMetadata from './getVegetableMetadata'

function getRouteData(handle: string) {
	const session = auth.getSession()

	return runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => vegetablePageQuery.run(session.client, { handle }),
				catch: (error) => console.log(error),
			}),
			...buildTraceAndMetrics('vegetable_page', { handle }),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)
}

export async function generateMetadata({
	params,
}: {
	params: { handle: string }
}): Promise<Metadata> {
	return getVegetableMetadata(await getRouteData(params.handle))
}

export default async function VegetableRoute({
	params: { handle },
}: {
	params: { handle: string }
}) {
	const vegetable = await getRouteData(handle)

	if (!vegetable) return notFound()

	return <VegetablePage vegetable={vegetable} />
}
