import { m } from '@/paraglide/messages'
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

export const generateMetadata = (): Metadata => ({
  title: m.soft_equal_trout_empower(),
  description: m.crisp_front_warthog_hope(),
})

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
