import type {
	VegetablesIndexFilterParams,
	VegetablesIndexQueryParams,
} from '@/queries'
import type { NextSearchParams } from '@/types'
import { VEGETABLES_PER_PAGE } from '@/utils/config'
import {
	EDIBLE_PART_TO_LABEL,
	PLANTING_METHOD_TO_LABEL,
	STRATUM_TO_LABEL,
	USAGE_TO_LABEL,
	VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'

const PAGE_INDEX_QUERY_KEY = 'pagina'
const FILTER_DEFINITIONS = [
	{
		queryKey: 'nome',
		filterKey: 'search_query',
		type: 'search_query',
	},
	{
		queryKey: 'estrato',
		filterKey: 'strata',
		values: Object.keys(STRATUM_TO_LABEL),
		type: 'multiselect',
	},
	{
		queryKey: 'usos',
		filterKey: 'uses',
		values: Object.keys(USAGE_TO_LABEL),
		type: 'multiselect',
	},
	{
		queryKey: 'comestivel',
		filterKey: 'edible_parts',
		values: Object.keys(EDIBLE_PART_TO_LABEL),
		type: 'multiselect',
	},
	{
		queryKey: 'plantio',
		filterKey: 'planting_methods',
		values: Object.keys(PLANTING_METHOD_TO_LABEL),
		type: 'multiselect',
	},
	{
		queryKey: 'ciclo',
		filterKey: 'lifecycles',
		values: Object.keys(VEGETABLE_LIFECYCLE_TO_LABEL),
		type: 'multiselect',
	},
] as const

export function nextSearchParamsToQueryParams(
	searchParams: NextSearchParams,
): VegetablesIndexQueryParams {
	const pageIndex = searchParams[PAGE_INDEX_QUERY_KEY]
		? Number(searchParams[PAGE_INDEX_QUERY_KEY] as string)
		: 0

	const filters = FILTER_DEFINITIONS.reduce(
		(accFilters, definition) => {
			const { queryKey, filterKey } = definition
			const queryValue = searchParams[queryKey]

			if (!queryValue) return accFilters

			const arrayValue = (
				Array.isArray(queryValue) ? queryValue : [queryValue]
			).filter(Boolean)

			if (definition.type === 'multiselect') {
				const validValues = arrayValue.filter((value) =>
					definition.values.includes(value),
				)
				if (validValues.length) {
					accFilters[filterKey] = validValues
				}
			}

			if (definition.type === 'search_query') {
				accFilters[filterKey] = arrayValue.join(' ')
			}

			return accFilters
		},
		{} as Record<string, string[] | string>,
	)

	return {
		...filters,
		offset: pageIndex * VEGETABLES_PER_PAGE,
	} as VegetablesIndexQueryParams
}

export function queryParamsToSearchParams(
	filterParams: VegetablesIndexFilterParams,
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

export function queryParamsToQueryKey(
	filterParams: VegetablesIndexFilterParams,
) {
	return [
		'vegetables',
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
