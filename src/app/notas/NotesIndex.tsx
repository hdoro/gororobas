'use client'

import NoteCard from '@/components/NoteCard'
import { NotesGridWrapper } from '@/components/NotesGrid'
import CheckboxesInput from '@/components/forms/CheckboxesInput'
import Field from '@/components/forms/Field'
import Carrot from '@/components/icons/Carrot'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import type { NotesIndexFilterParams } from '@/queries'
import { NOTES_PER_PAGE } from '@/utils/config'
import { getNoteCardTransform } from '@/utils/css'
import { NOTE_TYPE_TO_LABEL } from '@/utils/labels'
import {
	paths,
	persistParamsInUrl,
	searchParamsToNextSearchParams,
} from '@/utils/urls'
import { useInfiniteQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { InView } from 'react-intersection-observer'
import type { NotesIndexRouteData } from './fetchNotesIndex'
import {
	nextSearchParamsToQueryParams,
	queryParamsToQueryKey,
	queryParamsToSearchParams,
} from './notesFilterDefinition'

async function fetchNotesIndexFromClient(
	filterParams: NotesIndexFilterParams,
	pageIndex: number,
) {
	const response = await fetch(
		`/notas/api?${queryParamsToSearchParams(
			filterParams,
			pageIndex,
		).toString()}`,
	)
	return response.json() as unknown as NotesIndexRouteData
}

export default function NotesIndex() {
	const initialSearchParams = useSearchParams()
	const form = useForm<NotesIndexFilterParams>({
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
				fetchNotesIndexFromClient(filterParams, pageParam),
			initialPageParam: 0,
			getNextPageParam: (lastPage, _allPages, lastPageParam) => {
				if (!lastPage.notes || lastPage.notes.length < NOTES_PER_PAGE) {
					return undefined
				}

				return lastPageParam + 1
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
			!data.pages[0].notes ||
			data.pages[0].notes.length === 0)
	return (
		<main className="px-pageX py-10 flex flex-col lg:flex-row-reverse lg:items-start gap-x-8 gap-y-4">
			<div className="space-y-4 flex-[5] sticky top-4">
				<Text
					level="h1"
					as="h1"
					className="flex items-center justify-between flex-wrap"
				>
					Notas
					<Button asChild>
						<Link href={paths.newNote()}>Enviar sua nota</Link>
					</Button>
				</Text>
				<NotesGridWrapper className="relative justify-start py-4">
					{isFetching && !isFetchingNextPage && (
						<div className="absolute inset-0 bg-background bg-opacity-50 flex items-center justify-center gap-3">
							<Carrot className="animate-spin h-6 w-6" />
							Carregando...
						</div>
					)}
					{data?.pages?.map((page) => (
						<React.Fragment key={page.queryParams.offset}>
							{(page.notes || []).map((note) => (
								<NoteCard
									key={note.handle}
									note={note}
									transform={getNoteCardTransform()}
								/>
							))}
						</React.Fragment>
					))}
					{isFetchingNextPage && (
						<div className="flex items-center justify-center gap-3 py-10">
							<Carrot className="animate-spin h-6 w-6" />
							Carregando...
						</div>
					)}
				</NotesGridWrapper>
				{/* EMPTY STATE */}
				{isEmpty && (
					<Card aria-live="polite">
						<CardHeader>
							<CardTitle>Nenhuma nota encontrada</CardTitle>
							<Text>
								Tem algum experimento ou aprendizado pra compartilhar?
							</Text>
						</CardHeader>
						<CardContent>
							<Button asChild>
								<Link href={paths.newNote()}>Enviar uma nota</Link>
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
				<form className="max-w-xs sticky top-4">
					<Card className="lg:max-h-[calc(100dvh_-_2rem)] lg:overflow-hidden lg:flex lg:flex-col">
						<CardHeader>
							<CardTitle>Filtre os resultados</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6 lg:overflow-y-auto hide-scrollbar">
							<Field
								form={form}
								name="types"
								label="Tipo(s) de nota"
								render={({ field }) => (
									<CheckboxesInput
										field={field}
										options={Object.entries(NOTE_TYPE_TO_LABEL).map(
											([value, label]) => ({
												value,
												label,
											}),
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
