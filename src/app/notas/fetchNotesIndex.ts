import { auth } from '@/gel'
import { notesIndexQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import type { NextSearchParams } from '@/types'
import { searchParamsToNextSearchParams } from '@/utils/urls'
import { Effect, pipe } from 'effect'
import { notesNextSearchParamsToQueryParams } from './notesFilterDefinition'

export type NotesIndexRouteData = Awaited<ReturnType<typeof fetchNotesIndex>>

export default async function fetchNotesIndex(
  searchParams: NextSearchParams | URLSearchParams,
) {
  const queryParams = notesNextSearchParamsToQueryParams(
    searchParams instanceof URLSearchParams
      ? searchParamsToNextSearchParams(searchParams)
      : searchParams,
  )
  const normalizedParams = {
    ...queryParams,
    search_query: queryParams.search_query?.trim()
      ? `%${queryParams.search_query.trim()}%`
      : '',
  }
  const session = await auth.getSession()

  const notes = await runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => notesIndexQuery.run(session.client, normalizedParams),
        catch: (error) => console.log(error),
      }),
      ...buildTraceAndMetrics('notes_index', queryParams),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )

  return {
    notes,
    queryParams,
  }
}
