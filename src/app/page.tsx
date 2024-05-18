import HomePage from '@/components/HomePage'
import { client } from '@/edgedb'
import { homePageQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'

export default async function Home() {
	const data = await runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => homePageQuery.run(client),
				catch: (error) => console.log(error),
			}),
			...buildTraceAndMetrics('home_page'),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)

	return <HomePage {...(data || {})} />
}
