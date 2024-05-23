'use client'

import VegetableCard from '@/components/VegetableCard'
import { VegetablesGridWrapper } from '@/components/VegetablesGrid'
import CheckboxesInput from '@/components/forms/CheckboxesInput'
import Field from '@/components/forms/Field'
import Carrot from '@/components/icons/Carrot'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import type { VegetablesIndexFilterParams } from '@/queries'
import { VEGETABLES_PER_PAGE } from '@/utils/config'
import {
	EDIBLE_PART_TO_LABEL,
	PLANTING_METHOD_TO_LABEL,
	STRATUM_TO_LABEL,
	USAGE_TO_LABEL,
	VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { paths, persistParamsInUrl } from '@/utils/urls'
import { searchParamsToNextSearchParams } from '@/utils/urls'
import { useInfiniteQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { InView } from 'react-intersection-observer'
import type { VegetablesIndexRouteData } from './fetchVegetablesIndex'
import {
	nextSearchParamsToQueryParams,
	queryParamsToQueryKey,
	queryParamsToSearchParams,
} from './vegetablesFilterDefinition'

async function fetchVegetablesIndexFromClient(
	filterParams: VegetablesIndexFilterParams,
	pageIndex: number,
) {
	const response = await fetch(
		`/vegetais/api?${queryParamsToSearchParams(
			filterParams,
			pageIndex,
		).toString()}`,
	)
	return response.json() as unknown as VegetablesIndexRouteData
}

export default function VegetablesIndex() {
	const initialSearchParams = useSearchParams()
	const form = useForm<VegetablesIndexFilterParams>({
		defaultValues: nextSearchParamsToQueryParams(
			searchParamsToNextSearchParams(initialSearchParams),
		),
	})
	const filterParams = form.watch()
	const [autoFetchNextPageCount, setAutoFetchNextPageCount] = useState(0)
	const autoFetchNextPage = autoFetchNextPageCount < 2 // allow 3 auto fetches

	const queryKey = queryParamsToQueryKey(filterParams)
	const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
		useInfiniteQuery({
			queryKey,
			queryFn: ({ pageParam }) =>
				fetchVegetablesIndexFromClient(filterParams, pageParam),
			initialPageParam: 0,
			getNextPageParam: (lastPage) => {
				if (
					!lastPage.vegetables ||
					lastPage.vegetables.length < VEGETABLES_PER_PAGE
				) {
					return undefined
				}

				return lastPage.queryParams.pageIndex + 1
			},
		})

	// biome-ignore lint: We want to react to changes in the filter params
	useEffect(() => {
		// When query params change (form filters), reset the auto fetch count
		setAutoFetchNextPageCount(0)
		document.documentElement.scrollTo({
			top: 0,
			behavior: 'smooth',
		})
	}, [queryKey.join('')])

	useEffect(() => {
		persistParamsInUrl(queryParamsToSearchParams(filterParams))
	}, [filterParams])

	const isEmpty =
		!isFetching &&
		(!data?.pages ||
			!data.pages[0] ||
			!data.pages[0].vegetables ||
			data.pages[0].vegetables.length === 0)
	return (
		<main className="px-pageX py-10 flex flex-col lg:flex-row-reverse lg:items-start gap-x-8 gap-y-4">
			<div className="space-y-4 flex-[5] lg:sticky lg:top-4">
				<Text level="h1" as="h1">
					Vegetais
				</Text>
				<VegetablesGridWrapper>
					{isFetching && !isFetchingNextPage && (
						<div className="absolute inset-0 bg-background bg-opacity-50 flex items-center justify-center gap-3">
							<Carrot className="animate-spin h-6 w-6" />
							Carregando...
						</div>
					)}
					{data?.pages?.map((page) => (
						<React.Fragment key={page.queryParams.pageIndex}>
							{(page.vegetables || []).map((vegetable) => (
								<VegetableCard key={vegetable.id} vegetable={vegetable} />
							))}
						</React.Fragment>
					))}
					{isFetchingNextPage && (
						<div className="flex items-center justify-center gap-3 py-10">
							<Carrot className="animate-spin h-6 w-6" />
							Carregando...
						</div>
					)}
				</VegetablesGridWrapper>
				{/* EMPTY STATE */}
				{isEmpty && (
					<Card aria-live="polite">
						<CardHeader>
							<CardTitle>Nenhum vegetal encontrado</CardTitle>
							<Text>
								Conhece algum que não está na Gororobas? Esse site é
								colaborativo, você pode ajudar:
							</Text>
						</CardHeader>
						<CardContent>
							<Button asChild>
								<Link href={paths.newVegetable()}>Enviar um vegetal</Link>
							</Button>
						</CardContent>
					</Card>
				)}
				{hasNextPage &&
					!isFetchingNextPage &&
					(autoFetchNextPage ? (
						<InView
							as="div"
							onChange={(inView) => {
								if (inView) {
									setAutoFetchNextPageCount(autoFetchNextPageCount + 1)
									fetchNextPage()
								}
							}}
						/>
					) : (
						<div className="py-10 text-center">
							<Button
								onClick={() => {
									setAutoFetchNextPageCount(0)
									fetchNextPage()
								}}
								mode="outline"
							>
								Carregar próxima página
							</Button>
						</div>
					))}
			</div>
			<FormProvider {...form}>
				<form className="max-w-xs lg:sticky lg:top-4">
					<Card className="lg:max-h-[calc(100dvh_-_2rem)] lg:overflow-hidden lg:flex lg:flex-col">
						<CardHeader>
							<CardTitle>Filtre os resultados</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6 lg:overflow-y-auto hide-scrollbar">
							<Field
								form={form}
								name="strata"
								label="Estrato"
								render={({ field }) => (
									<CheckboxesInput
										field={field}
										options={Object.entries(STRATUM_TO_LABEL).map(
											([value, label]) => ({
												value,
												label,
											}),
										)}
									/>
								)}
							/>
							<Field
								form={form}
								name="lifecycles"
								label="Ciclo de vida"
								render={({ field }) => (
									<CheckboxesInput
										field={field}
										options={Object.entries(VEGETABLE_LIFECYCLE_TO_LABEL).map(
											([value, label]) => ({
												value,
												label,
											}),
										)}
									/>
								)}
							/>
							<Field
								form={form}
								name="uses"
								label="Principais usos"
								render={({ field }) => (
									<CheckboxesInput
										field={field}
										options={Object.entries(USAGE_TO_LABEL).map(
											([value, label]) => ({
												value,
												label,
											}),
										)}
									/>
								)}
							/>
							<Field
								form={form}
								name="planting_methods"
								label="Plantio por"
								render={({ field }) => (
									<CheckboxesInput
										field={field}
										options={Object.entries(PLANTING_METHOD_TO_LABEL).map(
											([value, label]) => ({ value, label }),
										)}
									/>
								)}
							/>
							<Field
								form={form}
								name="edible_parts"
								label="Partes comestíveis"
								render={({ field }) => (
									<CheckboxesInput
										field={field}
										options={Object.entries(EDIBLE_PART_TO_LABEL).map(
											([value, label]) => ({ value, label }),
										)}
									/>
								)}
							/>
						</CardContent>
					</Card>
				</form>
			</FormProvider>
		</main>
	)
}
