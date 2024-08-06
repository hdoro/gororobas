import type { NotesIndexFilterParams, NotesIndexQueryParams } from '@/queries'
import type { NextSearchParams } from '@/types'
import { NOTES_PER_PAGE } from '@/utils/config'
import { NOTE_TYPE_TO_LABEL } from '@/utils/labels'

const PAGE_INDEX_QUERY_KEY = 'pagina'
const FILTER_DEFINITIONS = [
  {
    queryKey: 'tipo',
    filterKey: 'types',
    values: Object.keys(NOTE_TYPE_TO_LABEL),
  },
] as const

export function nextSearchParamsToQueryParams(
  searchParams: NextSearchParams,
): NotesIndexQueryParams {
  const pageIndex = searchParams[PAGE_INDEX_QUERY_KEY]
    ? Number(searchParams[PAGE_INDEX_QUERY_KEY] as string)
    : 0

  const filters = FILTER_DEFINITIONS.reduce(
    (accFilters, definition) => {
      const { queryKey, filterKey, values } = definition
      const queryValue = searchParams[queryKey]
      if (!queryValue) return accFilters

      const arrayValue = Array.isArray(queryValue) ? queryValue : [queryValue]
      const validValues = arrayValue.filter((value) => values.includes(value))

      if (validValues.length) {
        accFilters[filterKey] = validValues
      }

      return accFilters
    },
    {} as Record<string, string[]>,
  )

  return {
    ...filters,
    offset: pageIndex * NOTES_PER_PAGE,
  } as NotesIndexQueryParams
}

export function queryParamsToSearchParams(
  filterParams: NotesIndexFilterParams,
  pageIndex?: number,
): URLSearchParams {
  const searchParams = new URLSearchParams()
  if (pageIndex) {
    searchParams.set(PAGE_INDEX_QUERY_KEY, String(pageIndex))
  }

  // Set all filters
  Object.entries(filterParams).forEach(([key, value]) => {
    const definition = FILTER_DEFINITIONS.find(
      (definition) => definition.filterKey === key,
    )
    if (!definition || !value) return

    const { queryKey } = definition

    if (Array.isArray(value)) {
      value.forEach((entry) => searchParams.append(queryKey, entry))
    } else {
      searchParams.set(queryKey, String(value))
    }
  })

  return searchParams
}

export function queryParamsToQueryKey(filterParams: NotesIndexFilterParams) {
  return [
    'notes',
    ...Object.entries(filterParams)
      .flatMap(([key, value]) => {
        if (!value) return []
        if (!Array.isArray(value)) {
          return [key, String(value)]
        }
        return [key, ...value]
      })
      .sort((a, b) => a.localeCompare(b)),
  ]
}
