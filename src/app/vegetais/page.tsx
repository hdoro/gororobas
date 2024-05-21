import type { Metadata } from 'next'
import TanstackQueryProvider from './TanstackQueryProvider'
import VegetablesIndex from './VegetablesIndex'
import fetchVegetablesIndex from './fetchVegetablesIndex'
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from '@tanstack/react-query'
import {
	nextSearchParamsToQueryParams,
	queryParamsToQueryKey,
} from './vegetablesFilterDefinition'

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

	await queryClient.prefetchQuery({
		queryKey: queryParamsToQueryKey(
			nextSearchParamsToQueryParams(searchParams),
		),
		queryFn: () => fetchVegetablesIndex(searchParams),
	})

	return (
		<TanstackQueryProvider>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<VegetablesIndex />
			</HydrationBoundary>
		</TanstackQueryProvider>
	)
}
