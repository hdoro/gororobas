'use client'

import NoteCard from '@/components/NoteCard'
import { NotesGridWrapper } from '@/components/NotesGrid'
import CheckboxesInput from '@/components/forms/CheckboxesInput'
import Field from '@/components/forms/Field'
import Carrot from '@/components/icons/Carrot'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { m } from '@/paraglide/messages'
import type { NotesIndexFilterParams } from '@/queries'
import { NOTES_PER_PAGE } from '@/utils/config'
import { NOTE_TYPE_TO_LABEL } from '@/utils/labels'
import { queryParamsToQueryKey } from '@/utils/queryParams'
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
import { useDebounce } from 'use-debounce'
import type { NotesIndexRouteData } from './fetchNotesIndex'
import {
  notesNextSearchParamsToQueryParams,
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
    defaultValues: notesNextSearchParamsToQueryParams(
      searchParamsToNextSearchParams(initialSearchParams),
    ),
  })
  let filterParams = form.watch()
  const [debouncedSearchQuery] = useDebounce(filterParams.search_query, 600, {
    maxWait: 3000,
    leading: false,
  })
  filterParams = {
    ...filterParams,
    search_query: debouncedSearchQuery || null,
  }
  const [autoFetchNextPageCount, setAutoFetchNextPageCount] = useState(0)
  const autoFetchNextPage = autoFetchNextPageCount < 2 // allow 3 auto fetches

  const queryKey = queryParamsToQueryKey(filterParams, 'notes')
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
    <main className="px-pageX space-y-6 py-10">
      <div className="space-y-1">
        <Text
          level="h1"
          as="h1"
          className="flex flex-wrap items-center justify-between"
        >
          Notas
          <Button asChild>
            <Link href={paths.newNote()}>{m.this_patient_ant_enrich()}</Link>
          </Button>
        </Text>
        <Text level="h2" as="p" className="max-w-md font-normal">
          Aprendizados e experimentos na cozinha, no plantio e no sacolão
        </Text>
      </div>
      <FormProvider {...form}>
        <form className="bg-background sticky top-0 z-10 flex flex-wrap items-center gap-2 py-2">
          <Field
            form={form}
            name="search_query"
            label="Conteúdo"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value || ''}
                type="text"
                placeholder="Buscar por texto nas notas"
                className="min-w-2xs"
              />
            )}
            hideLabel
          />
          <Card className="flex-1 pr-0">
            <CardHeader className="sr-only">
              <CardTitle>Filtre os resultados</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pr-0 md:py-0">
              <Field
                form={form}
                name="types"
                label="Tipo(s) de nota"
                classNames={{
                  root: 'flex space-y-0 gap-x-2 gap-y-3 items-center flex-wrap py-2',
                  label: 'flex-[0_0_max-content]',
                }}
                render={({ field }) => (
                  <CheckboxesInput
                    field={field}
                    options={Object.entries(NOTE_TYPE_TO_LABEL).map(
                      ([value, label]) => ({
                        value,
                        label,
                      }),
                    )}
                    className="hide-scrollbar scrollbar-gradient-x flex-nowrap overflow-x-auto overflow-y-visible px-1"
                  />
                )}
              />
            </CardContent>
          </Card>
        </form>
      </FormProvider>
      <NotesGridWrapper className="hide-scrollbar relative justify-start overflow-x-hidden py-4">
        {isFetching && !isFetchingNextPage && (
          <div className="bg-background bg-opacity-50 absolute inset-0 flex items-center justify-center gap-3">
            <Carrot className="h-6 w-6 animate-spin" />
            Carregando...
          </div>
        )}
        {data?.pages?.map((page) => (
          <React.Fragment key={page.queryParams.offset}>
            {(page.notes || []).map((note) => (
              <NoteCard key={note.handle} note={note} />
            ))}
          </React.Fragment>
        ))}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-3 py-10">
            <Carrot className="h-6 w-6 animate-spin" />
            Carregando...
          </div>
        )}
      </NotesGridWrapper>
      {/* EMPTY STATE */}
      {isEmpty && (
        <Card aria-live="polite">
          <CardHeader>
            <CardTitle>Nenhuma nota encontrada</CardTitle>
            <Text>Tem algum experimento ou aprendizado pra compartilhar?</Text>
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
    </main>
  )
}
