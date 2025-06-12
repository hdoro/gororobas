import { m } from '@/paraglide/messages'
import { queryParamsToQueryKey } from '@/utils/queryParams'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import type { Metadata } from 'next'
import VegetablesIndex from './VegetablesIndex'
import fetchVegetablesIndex from './fetchVegetablesIndex'
import { vegetablesNextSearchParamsToQueryParams } from './vegetablesFilters'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: m.mellow_fair_scallop_nurture(),
    description: m.bland_ok_pigeon_sway(),
  }
}

export default async function VegetablesRoute(props: {
  searchParams: Promise<{
    [query: string]: string | string[]
  }>
}) {
  const searchParams = await props.searchParams
  const queryClient = new QueryClient()

  await queryClient.prefetchInfiniteQuery({
    queryKey: queryParamsToQueryKey(
      vegetablesNextSearchParamsToQueryParams(searchParams, 'search'),
      'vegetables',
    ),
    queryFn: () => fetchVegetablesIndex(searchParams),
    initialPageParam: 0,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VegetablesIndex />
    </HydrationBoundary>
  )
}
