'use client'

import LoadingSpinner from '@/components/LoadingSpinner'
import ResourceCard from '@/components/ResourceCard'
import { SanityImage } from '@/components/SanityImage'
import CheckboxesInput from '@/components/forms/CheckboxesInput'
import Field from '@/components/forms/Field'
import ReferenceListInput, {
  useReferenceOptions,
} from '@/components/forms/ReferenceListInput'
import Carrot from '@/components/icons/Carrot'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Text } from '@/components/ui/text'
import type { ResourceCardData, ResourcesIndexFilterParams } from '@/queries'
import type { ReferenceObjectType } from '@/types'
import { RESOURCES_PER_PAGE } from '@/utils/config'
import { queryParamsToQueryKey } from '@/utils/queryParams'
import {
  paths,
  persistParamsInUrl,
  searchParamsToNextSearchParams,
} from '@/utils/urls'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ArrowRightCircle,
  FilterIcon,
  PlusCircleIcon,
  XIcon,
} from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import * as motion from 'motion/react-client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { InView } from 'react-intersection-observer'
import type { ResourcesIndexRouteData } from './fetchResourcesIndex'
import { FILTER_DEFINITIONS } from './resourceFilterDefinitions'
import {
  type ResourcesSearchFormValue,
  queryParamsToSearchParams,
  resourcesNextSearchParamsToQueryParams,
} from './resourcesFilters'

async function fetchResourcesIndexFromClient(
  filterParams: ResourcesIndexFilterParams,
  pageIndex: number,
) {
  const response = await fetch(
    `/biblioteca/api?${queryParamsToSearchParams(
      filterParams,
      pageIndex,
    ).toString()}`,
  )
  return response.json() as unknown as ResourcesIndexRouteData
}

export default function ResourcesIndex() {
  const initialSearchParams = useSearchParams()
  const form = useForm<ResourcesSearchFormValue>({
    defaultValues: resourcesNextSearchParamsToQueryParams(
      searchParamsToNextSearchParams(initialSearchParams),
      'form',
    ),
  })
  const filterParams = form.watch()
  const [autoFetchNextPageCount, setAutoFetchNextPageCount] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const autoFetchNextPage = autoFetchNextPageCount < 2 // allow 3 auto fetches

  const queryKey = queryParamsToQueryKey(filterParams, 'resources')
  // @TODO debounce search_query to avoid happening at every keystroke
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) =>
        fetchResourcesIndexFromClient(filterParams, pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage, _allPages, lastPageParam) => {
        if (
          !lastPage.resources ||
          lastPage.resources.length < RESOURCES_PER_PAGE
        ) {
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
      !data.pages[0].resources ||
      data.pages[0].resources.length === 0)

  const [activeFilterKey, setActiveFilterKey] = useState<
    (typeof FILTER_DEFINITIONS)[number]['filterKey'] | null
  >(null)
  const activeFilter = activeFilterKey
    ? (FILTER_DEFINITIONS.find(
        (filter) => filter.filterKey === activeFilterKey,
      ) ?? null)
    : null

  return (
    <main className="px-pageX pt-12 pb-30">
      <div className="space-y-1">
        <Text level="h1" as="h1">
          Biblioteca Agroecológica
        </Text>
        <Text level="h2" as="p" className="font-normal">
          Livros, organizações, vídeos e mais sobre agroecologia, agrofloresta e
          a luta por terra e território.
        </Text>
      </div>
      <FormProvider {...form}>
        <form className="bg-background sticky top-0 z-30 mt-8 py-2">
          <div className="xl:flex xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2 lg:flex-nowrap">
              <Field
                form={form}
                name="search_query"
                label="Nome"
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value || ''}
                    type="text"
                    placeholder="Buscar por título"
                    className="md:min-w-2xs"
                  />
                )}
                hideLabel
              />
              {/* @TODO
              - posição do popover
              */}
              <Popover
                open={filtersOpen}
                onOpenChange={(newState) => {
                  setFiltersOpen(newState)
                }}
              >
                <PopoverTrigger
                  asChild
                  // Ensure we're opening the top-level filter menu, as opposed to whichever filter was active before
                  onClick={() => setActiveFilterKey(null)}
                >
                  <Button>
                    <FilterIcon className="mr-2 h-auto w-[1.25em]" />
                    Filtros
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-1">
                  <AnimatePresence mode="popLayout">
                    {activeFilter ? (
                      <motion.div
                        initial={{ opacity: 0, translateX: 32 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        exit={{ opacity: 0, translateX: -32 }}
                        key="active-filter"
                      >
                        <div className="flex items-center">
                          <Button
                            onClick={() => setActiveFilterKey(null)}
                            mode="bleed"
                            size="icon"
                            tone="neutral"
                          >
                            <ArrowLeft className="size-4 opacity-90" />
                            <span className="sr-only">Voltar</span>
                          </Button>
                          <Text level="p" as="p" aria-hidden weight="semibold">
                            {activeFilter.label}
                          </Text>
                        </div>
                        {activeFilter.type === 'multiselect' && (
                          <Field
                            form={form}
                            name={activeFilter.filterKey}
                            label={activeFilter.label}
                            classNames={{ root: 'p-2', label: 'sr-only' }}
                            render={({ field }) => (
                              <CheckboxesInput
                                field={field}
                                options={Object.entries(
                                  activeFilter.valueLabels,
                                ).map(([value, label]) => ({ value, label }))}
                                layout="checkbox-stack"
                              />
                            )}
                          />
                        )}
                        {activeFilter.type === 'reference' && (
                          <Field
                            form={form}
                            name={activeFilter.filterKey}
                            label={activeFilter.label}
                            classNames={{
                              root: 'p-2',
                              label: 'sr-only',
                            }}
                            render={({ field }) => (
                              <ReferenceListInput
                                field={field}
                                objectTypes={[activeFilter.objectType]}
                                valueType={'handle'}
                                layout="list"
                              />
                            )}
                          />
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        className="space-y-0"
                        initial={{ opacity: 0, translateX: -32 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        exit={{ opacity: 0, translateX: 32 }}
                        key="filter-list"
                      >
                        {FILTER_DEFINITIONS.map((definition) => {
                          if (definition.type === 'search_query') return null

                          return (
                            <Button
                              key={definition.filterKey}
                              mode="bleed"
                              tone="neutral"
                              onClick={() =>
                                setActiveFilterKey(definition.filterKey)
                              }
                              className="group w-full px-2 text-left"
                            >
                              <definition.icon className="size-[1.25em] opacity-90" />
                              <span className="flex-1">{definition.label}</span>
                              <ArrowRightCircle className="size-[1em] opacity-0 transition-opacity group-hover:opacity-70" />
                            </Button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </PopoverContent>

                <div className="hide-scrollbar flex gap-3 overflow-auto">
                  {FILTER_DEFINITIONS.map((definition) => {
                    const values = filterParams[definition.filterKey]

                    if (
                      definition.type === 'search_query' ||
                      !values ||
                      !Array.isArray(values) ||
                      values.length === 0
                    ) {
                      return null
                    }

                    return (
                      <div
                        key={definition.filterKey}
                        className="flex flex-[0_0_max-content] items-center overflow-hidden rounded-xl border bg-white whitespace-nowrap"
                      >
                        <Text
                          level="sm"
                          as="div"
                          className="flex items-center gap-1 px-2"
                        >
                          <definition.icon className="size-[1.25em] opacity-90" />
                          <span>{definition.label}</span>
                        </Text>
                        <Button
                          mode="bleed"
                          tone="neutral"
                          onClick={() => {
                            setFiltersOpen(true)
                            setActiveFilterKey(definition.filterKey)
                          }}
                          size="sm"
                          className="bg-background block h-full max-w-[100px] overflow-hidden rounded-none px-2 text-left text-ellipsis whitespace-nowrap"
                        >
                          {definition.type === 'multiselect' && (
                            <>
                              <span
                                // Hide all values when there are more than 1, but keep it for screen readers
                                className={values.length > 1 ? 'sr-only' : ''}
                              >
                                {values
                                  .map(
                                    (value) =>
                                      definition.valueLabels[
                                        value as keyof typeof definition.valueLabels
                                      ],
                                  )
                                  .join(', ')}
                              </span>
                              {values.length > 1 && (
                                <span aria-hidden>{values.length} opções</span>
                              )}
                            </>
                          )}
                          {definition.type === 'reference' && (
                            <ReferenceRenderer
                              objectTypes={[definition.objectType]}
                              values={values}
                            />
                          )}
                        </Button>
                        <Button
                          mode="bleed"
                          tone="neutral"
                          onClick={() =>
                            form.setValue(definition.filterKey, undefined)
                          }
                          title={`Remover filtro para ${definition.label}`}
                          className="rounded-none px-2"
                        >
                          <XIcon className="size-[1em]" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </Popover>
            </div>

            <Button asChild mode="outline" className="max-xl:mt-4">
              <Link href={paths.newResource()}>
                <PlusCircleIcon />
                Enviar material
              </Link>
            </Button>
          </div>
        </form>
      </FormProvider>
      <div className="relative mt-2 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isFetching && !isFetchingNextPage && (
            <div className="bg-background bg-opacity-50 absolute inset-0 flex items-center justify-center gap-3">
              <Carrot className="h-6 w-6 animate-spin" />
              Carregando...
            </div>
          )}
          {data?.pages?.map((page) => (
            <React.Fragment key={page.queryParams.offset}>
              {(page.resources || []).map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource as ResourceCardData}
                />
              ))}
            </React.Fragment>
          ))}
          {isFetchingNextPage && (
            <LoadingSpinner className="col-span-full py-20" />
          )}
        </div>
        {/* EMPTY STATE */}
        {isEmpty && (
          <Card aria-live="polite">
            <CardHeader>
              <CardTitle>Nenhum material encontrado</CardTitle>
              <Text>
                Conhece algum que não está na biblioteca? O Gororobas é
                colaborativo, você pode ajudar:
              </Text>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={paths.newResource()}>Enviar um material</Link>
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
    </main>
  )
}

function ReferenceRenderer({
  objectTypes,
  values,
}: {
  objectTypes: ReferenceObjectType[]
  values: string[]
}) {
  const { optionsMap } = useReferenceOptions(objectTypes)

  const validValues = values.flatMap((value) => optionsMap[value] || [])

  if (!validValues.length)
    return <LoadingSpinner className="gap-1 py-1" showLabel={false} />

  return (
    <div className="flex items-center">
      {validValues.slice(0, 2).map((value) => (
        <div key={value.value} className="flex items-center gap-2">
          {value.image && (
            <SanityImage
              image={value.image}
              maxWidth={24}
              className="block size-[1.5em] flex-[0_0_1.5em] rounded-full object-cover"
              alt={`Foto de ${value.label}`}
            />
          )}
          <span>{value.label}</span>
        </div>
      ))}
      {validValues.length > 2 && (
        <span className="flex items-center gap-2">
          +{validValues.length - 2}
        </span>
      )}
    </div>
  )
}
