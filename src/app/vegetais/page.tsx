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

export const metadata: Metadata = {
  title: 'Todos os vegetais e suas propriedades agroecológicas | Gororobas',
  description:
    'Descubra como plantar centenas de vegetais de forma agroecológica. O Gororobas é uma enciclopédia colaborativa, participe também :)',
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
