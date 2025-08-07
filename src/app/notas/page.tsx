import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import type { Metadata } from 'next'
import { queryParamsToQueryKey } from '@/utils/queryParams'
import fetchNotesIndex from './fetchNotesIndex'
import NotesIndex from './NotesIndex'
import { notesNextSearchParamsToQueryParams } from './notesFilterDefinition'

export const metadata: Metadata = {
  title:
    'Aprendizados e experimentos na cozinha, no plantio e no sacolão | Gororobas',
  description:
    'Notinhas compartilhadas por pessoas reais, em contextos reais. Escreva você também!',
}

export default async function NotesRoute(props: {
  searchParams: Promise<{
    [query: string]: string | string[]
  }>
}) {
  const searchParams = await props.searchParams
  const queryClient = new QueryClient()

  await queryClient.prefetchInfiniteQuery({
    queryKey: queryParamsToQueryKey(
      notesNextSearchParamsToQueryParams(searchParams),
      'notes',
    ),
    queryFn: () => fetchNotesIndex(searchParams),
    initialPageParam: 0,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesIndex />
    </HydrationBoundary>
  )
}
