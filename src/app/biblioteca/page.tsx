import { queryParamsToQueryKey } from '@/utils/queryParams'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import type { Metadata } from 'next'
import ResourcesIndex from './ResourcesIndex'
import fetchResourcesIndex from './fetchResourcesIndex'
import { resourcesNextSearchParamsToQueryParams } from './resourcesFilters'

export const metadata: Metadata = {
  title: 'Biblioteca Agroecológica | Gororobas',
  description:
    'Livros, organizações, vídeos e mais sobre agroecologia, agrofloresta e a luta por terra e território.',
}

export default async function ResourcesRoute(props: {
  searchParams: Promise<{
    [query: string]: string | string[]
  }>
}) {
  const searchParams = await props.searchParams
  const queryClient = new QueryClient()

  await queryClient.prefetchInfiniteQuery({
    queryKey: queryParamsToQueryKey(
      resourcesNextSearchParamsToQueryParams(searchParams, 'search'),
      'resources',
    ),
    queryFn: () => fetchResourcesIndex(searchParams),
    initialPageParam: 0,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ResourcesIndex />
    </HydrationBoundary>
  )
}
