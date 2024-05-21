'use client'

import VegetableCard from '@/components/VegetableCard'
import CheckboxesInput from '@/components/forms/CheckboxesInput'
import Field from '@/components/forms/Field'
import Carrot from '@/components/icons/Carrot'
import { Text } from '@/components/ui/text'
import type { VegetablesIndexData, VegetablesIndexQueryParams } from '@/queries'
import {
	EDIBLE_PART_TO_LABEL,
	PLANTING_METHOD_TO_LABEL,
	STRATUM_TO_LABEL,
	USAGE_TO_LABEL,
	VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { persistParamsInUrl } from '@/utils/urls'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import {
	nextSearchParamsToQueryParams,
	queryParamsToQueryKey,
	queryParamsToSearchParams,
	searchParamsToNextSearchParams,
} from './vegetablesFilterDefinition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function fetchVegetablesIndexFromClient(
	queryParams: VegetablesIndexQueryParams,
) {
	const response = await fetch(
		`/vegetais/api?${queryParamsToSearchParams(queryParams).toString()}`,
	)
	return response.json() as unknown as {
		vegetables: VegetablesIndexData
		params: VegetablesIndexQueryParams
	}
}

export default function VegetablesIndex() {
	const initialSearchParams = useSearchParams()
	const form = useForm<VegetablesIndexQueryParams>({
		defaultValues: nextSearchParamsToQueryParams(
			searchParamsToNextSearchParams(initialSearchParams),
		),
	})
	const queryParams = form.watch()
	const { data, isFetching } = useQuery({
		queryKey: queryParamsToQueryKey(queryParams),
		queryFn: () => fetchVegetablesIndexFromClient(queryParams),
	})
	const { vegetables } = (data || {
		vegetables: [],
		params: {},
	}) as { vegetables: VegetablesIndexData; params: VegetablesIndexQueryParams }

	useEffect(() => {
		persistParamsInUrl(queryParamsToSearchParams(queryParams))
	}, [queryParams])

	return (
		<main className="px-pageX py-10 flex flex-col lg:flex-row-reverse lg:items-start gap-x-8 gap-y-4">
			<div className="space-y-4 flex-[5] sticky top-4">
				<Text
					level="h1"
					as="h1"
					style={{
						gridArea: 'title',
					}}
				>
					Vegetais
				</Text>
				<div
					className="grid gap-9 relative"
					style={{
						gridArea: 'content',
						gridTemplateColumns:
							'repeat(auto-fill, var(--vegetable-card-width))',
					}}
				>
					{isFetching && (
						<div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center gap-3">
							<Carrot className="animate-spin h-6 w-6" />
							Carregando...
						</div>
					)}
					{vegetables?.map((vegetable) => (
						<VegetableCard key={vegetable.id} vegetable={vegetable} />
					))}
				</div>
			</div>
			<FormProvider {...form}>
				<form
					style={{
						gridArea: 'form',
					}}
					className="max-w-xs sticky top-4"
				>
					<Card>
						<CardHeader>
							<CardTitle>Filtre os resultados</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
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
