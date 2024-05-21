import type { VegetablesIndexQueryParams } from '@/queries'
import {
	EDIBLE_PART_TO_LABEL,
	PLANTING_METHOD_TO_LABEL,
	STRATUM_TO_LABEL,
	USAGE_TO_LABEL,
	VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import type { ReadonlyURLSearchParams } from 'next/navigation'

const vegetablesFilterDefinition = [
	{
		queryKey: 'estrato',
		filterKey: 'strata',
		values: Object.keys(STRATUM_TO_LABEL),
	},
	{
		queryKey: 'usos',
		filterKey: 'uses',
		values: Object.keys(USAGE_TO_LABEL),
	},
	{
		queryKey: 'comestivel',
		filterKey: 'edible_parts',
		values: Object.keys(EDIBLE_PART_TO_LABEL),
	},
	{
		queryKey: 'plantio',
		filterKey: 'planting_methods',
		values: Object.keys(PLANTING_METHOD_TO_LABEL),
	},
	{
		queryKey: 'ciclo',
		filterKey: 'lifecycles',
		values: Object.keys(VEGETABLE_LIFECYCLE_TO_LABEL),
	},
] as const

export type NextSearchParams = {
	[query: string]: string | string[]
}

export function searchParamsToNextSearchParams(
	searchParams: URLSearchParams | ReadonlyURLSearchParams,
): NextSearchParams {
	return Object.fromEntries(searchParams.entries())
}

export function nextSearchParamsToQueryParams(
	searchParams: NextSearchParams,
): VegetablesIndexQueryParams {
	const filters = vegetablesFilterDefinition.reduce(
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

	const pageIndex = searchParams.pagina
		? Number(searchParams.pagina as string)
		: 0

	return {
		...filters,
		pageIndex,
	} as VegetablesIndexQueryParams
}

export function queryParamsToSearchParams(
	params: VegetablesIndexQueryParams,
): URLSearchParams {
	const searchParams = new URLSearchParams()
	Object.entries(params).forEach(([key, value]) => {
		const definition = vegetablesFilterDefinition.find(
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

export function queryParamsToQueryKey(params: VegetablesIndexQueryParams) {
	return [
		'vegetables',
		...Object.entries(params)
			.map(([key, value]) => {
				if (!value) return []
				if (!Array.isArray(value)) {
					return [key, value]
				}
				return [key, ...value.sort((a, b) => a.localeCompare(b))]
			})
			.flat(2),
	]
}
