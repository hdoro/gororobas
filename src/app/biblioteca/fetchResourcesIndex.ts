import { auth } from '@/gel'
import { resourcesIndexQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import type { NextSearchParams } from '@/types'
import { shuffleArray } from '@/utils/arrays'
import { searchParamsToNextSearchParams } from '@/utils/urls'
import { Effect, pipe } from 'effect'
import { resourcesNextSearchParamsToQueryParams } from './resourcesFilters'

export type ResourcesIndexRouteData = Awaited<
  ReturnType<typeof fetchResourcesIndex>
>

export default async function fetchResourcesIndex(
  searchParams: NextSearchParams | URLSearchParams,
) {
  const queryParams = resourcesNextSearchParamsToQueryParams(
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

  const resources = await runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => resourcesIndexQuery.run(session.client, normalizedParams),
        catch: (error) => console.log(error),
      }),
      ...buildTraceAndMetrics('resources_index', normalizedParams),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )

  return {
    resources: shuffleArray(resources),
    queryParams,
  }
}
