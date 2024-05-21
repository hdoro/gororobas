import { auth } from '@/edgedb'
import { vegetablesIndexQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import {
	nextSearchParamsToQueryParams,
	searchParamsToNextSearchParams,
	type NextSearchParams,
} from './vegetablesFilterDefinition'

export const metadata: Metadata = {
	title: 'Todos os vegetais e suas propriedades agroecológicas | Gororobas',
	description:
		'Descubra como plantar centenas de vegetais de forma agroecológica. O Gororobas é uma enciclopédia colaborativa, participe também :)',
}

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
