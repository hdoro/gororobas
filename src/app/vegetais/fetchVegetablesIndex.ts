import { auth } from '@/edgedb'
import { vegetablesIndexQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import {
	type NextSearchParams,
	nextSearchParamsToQueryParams,
	searchParamsToNextSearchParams,
} from './vegetablesFilterDefinition'

export type VegetablesIndexRouteData = Awaited<
	ReturnType<typeof fetchVegetablesIndex>
>

export default async function fetchVegetablesIndex(
	searchParams: NextSearchParams | URLSearchParams,
) {
	const queryParams = nextSearchParamsToQueryParams(
		searchParams instanceof URLSearchParams
			? searchParamsToNextSearchParams(searchParams)
			: searchParams,
	)
	const session = auth.getSession()

	const vegetables = await runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => vegetablesIndexQuery.run(session.client, queryParams),
				catch: (error) => console.log(error),
			}),
			...buildTraceAndMetrics('vegetables_index', queryParams),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)

	return {
		vegetables,
		queryParams,
	}
}
