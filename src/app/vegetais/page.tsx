import TanstackQueryProvider from '@/components/TanstackQueryProvider'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import type { Metadata } from 'next'
import VegetablesIndex from './VegetablesIndex'
import fetchVegetablesIndex from './fetchVegetablesIndex'
import {
  nextSearchParamsToQueryParams,
  queryParamsToQueryKey,
} from './vegetablesFilters'

export const metadata: Metadata = {
  title: 'Todos os vegetais e suas propriedades agroecológicas | Gororobas',
  description:
    'Descubra como plantar centenas de vegetais de forma agroecológica. O Gororobas é uma enciclopédia colaborativa, participe também :)',
}

export default async function VegetablesRoute({
  searchParams,
}: {
  searchParams: {
    [query: string]: string | string[]
  }
}) {
  const queryClient = new QueryClient()

  await queryClient.prefetchInfiniteQuery({
    queryKey: queryParamsToQueryKey(
      nextSearchParamsToQueryParams(searchParams, 'search'),
    ),
    queryFn: () => fetchVegetablesIndex(searchParams),
    initialPageParam: 0,
  })

  return (
    <TanstackQueryProvider>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <VegetablesIndex />
      </HydrationBoundary>
    </TanstackQueryProvider>
  )
}
