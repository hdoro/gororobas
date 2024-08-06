import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import type { Metadata } from 'next'
import TanstackQueryProvider from '../../components/TanstackQueryProvider'
import NotesIndex from './NotesIndex'
import fetchNotesIndex from './fetchNotesIndex'
import {
  nextSearchParamsToQueryParams,
  queryParamsToQueryKey,
} from './notesFilterDefinition'

export const metadata: Metadata = {
  title:
    'Aprendizados e experimentos na cozinha, no plantio e no sacolão | Gororobas',
  description:
    'Notinhas compartilhadas por pessoas reais, em contextos reais. Escreva você também!',
}

export default async function NotesRoute({
  searchParams,
}: {
  searchParams: {
    [query: string]: string | string[]
  }
}) {
  const queryClient = new QueryClient()

  await queryClient.prefetchInfiniteQuery({
    queryKey: queryParamsToQueryKey(
      nextSearchParamsToQueryParams(searchParams),
    ),
    queryFn: () => fetchNotesIndex(searchParams),
    initialPageParam: 0,
  })

  return (
    <TanstackQueryProvider>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <NotesIndex />
      </HydrationBoundary>
    </TanstackQueryProvider>
  )
}
