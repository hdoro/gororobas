import { auth } from '@/gel'
import { vegetablesIndexQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import type { NextSearchParams } from '@/types'
import { searchParamsToNextSearchParams } from '@/utils/urls'
import { Effect, pipe } from 'effect'
import { vegetablesNextSearchParamsToQueryParams } from './vegetablesFilters'

export type VegetablesIndexRouteData = Awaited<
  ReturnType<typeof fetchVegetablesIndex>
>

export default async function fetchVegetablesIndex(
  searchParams: NextSearchParams | URLSearchParams,
) {
  const queryParams = vegetablesNextSearchParamsToQueryParams(
    searchParams instanceof URLSearchParams
      ? searchParamsToNextSearchParams(searchParams)
      : searchParams,
    'search',
  )
  const normalizedParams = {
    ...queryParams,
    search_query: queryParams.search_query?.trim()
      ? `%${queryParams.search_query.trim()}%`
      : '',
  }
  const session = await auth.getSession()

  const vegetables = await runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => vegetablesIndexQuery.run(session.client, normalizedParams),
        catch: (error) => console.log(error),
      }),
      ...buildTraceAndMetrics('vegetables_index', normalizedParams),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )

  return {
    vegetables,
    queryParams,
  }
}
