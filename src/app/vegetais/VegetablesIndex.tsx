'use client'

import VegetableCard from '@/components/VegetableCard'
import { VegetablesGridWrapper } from '@/components/VegetablesGrid'
import CheckboxesInput from '@/components/forms/CheckboxesInput'
import Field from '@/components/forms/Field'
import SliderRangeInput from '@/components/forms/SliderRangeInput'
import Carrot from '@/components/icons/Carrot'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import type { VegetablesIndexFilterParams } from '@/queries'
import {
  MAX_ACCEPTED_TEMPERATURE,
  MIN_ACCEPTED_TEMPERATURE,
  type RangeFormValue,
} from '@/schemas'
import { VEGETABLES_PER_PAGE } from '@/utils/config'
import {
  EDIBLE_PART_TO_LABEL,
  PLANTING_METHOD_TO_LABEL,
  STRATUM_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import {
  MAX_ACCEPTED_HEIGHT,
  type NumberFormat,
  formatNumber,
} from '@/utils/numbers'
import {
  paths,
  persistParamsInUrl,
  searchParamsToNextSearchParams,
} from '@/utils/urls'
import { useInfiniteQuery } from '@tanstack/react-query'
import { FilterIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { Fragment, useEffect, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { InView } from 'react-intersection-observer'
import type { VegetablesIndexRouteData } from './fetchVegetablesIndex'
import { FILTER_DEFINITIONS } from './vegetableFilterDefinitions'
import {
  type VegetablesSearchFormValue,
  nextSearchParamsToQueryParams,
  queryParamsToQueryKey,
  queryParamsToSearchParams,
} from './vegetablesFilters'

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
  const form = useForm<VegetablesSearchFormValue>({
    defaultValues: nextSearchParamsToQueryParams(
      searchParamsToNextSearchParams(initialSearchParams),
      'form',
    ),
  })
  const filterParams = form.watch()
  const [autoFetchNextPageCount, setAutoFetchNextPageCount] = useState(0)
  const autoFetchNextPage = autoFetchNextPageCount < 2 // allow 3 auto fetches

  const queryKey = queryParamsToQueryKey(filterParams)
  // @TODO debounce search_query to avoid happening at every keystroke
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) =>
        fetchVegetablesIndexFromClient(filterParams, pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage, _allPages, lastPageParam) => {
        if (
          !lastPage.vegetables ||
          lastPage.vegetables.length < VEGETABLES_PER_PAGE
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
      !data.pages[0].vegetables ||
      data.pages[0].vegetables.length === 0)

  return (
    <main className="px-pageX py-10">
      <div className="space-y-1">
        <Text level="h1" as="h1">
          Vegetais
        </Text>
        <Text level="h2" as="p" className="font-normal">
          Conhecimento em agroecologia sobre mais de 400 vegetais
        </Text>
      </div>
      <FormProvider {...form}>
        <form className="bg-background sticky top-0 z-30 mt-8 py-2">
          <Dialog>
            <div className="xl:flex xl:items-center xl:justify-between">
              <div className="flex gap-2">
                <Field
                  form={form}
                  name="search_query"
                  label="Nome"
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value || ''}
                      type="text"
                      placeholder="Buscar por nome"
                    />
                  )}
                  hideLabel
                />
                <DialogTrigger asChild>
                  <Button>
                    <FilterIcon className="mr-2 h-auto w-[1.25em]" />
                    Filtros
                  </Button>
                </DialogTrigger>
              </div>
              <div className="mt-2 flex items-center gap-2 overflow-auto">
                {Object.entries(filterParams).map(([key, values]) => {
                  if (
                    key === 'search_query' ||
                    !values ||
                    !Array.isArray(values) ||
                    values.length === 0
                  )
                    return null

                  const filterDefinition = FILTER_DEFINITIONS.find(
                    (filter) => filter.filterKey === key,
                  )
                  if (!filterDefinition) return null

                  if (filterDefinition.type === 'range') {
                    return (
                      <RangeFilterDisplay
                        key={key}
                        filterKey={key}
                        values={values}
                      />
                    )
                  }

                  const labels = {
                    strata: STRATUM_TO_LABEL,
                    lifecycles: VEGETABLE_LIFECYCLE_TO_LABEL,
                    uses: USAGE_TO_LABEL,
                    planting_methods: PLANTING_METHOD_TO_LABEL,
                    edible_parts: EDIBLE_PART_TO_LABEL,
                  }[key]
                  return (
                    <Fragment key={key}>
                      {values.map((v) => (
                        <Badge key={`${key}-${v}`} variant="outline">
                          {labels?.[v as keyof typeof labels] || values}
                          <Button
                            size="icon"
                            mode="bleed"
                            tone="neutral"
                            onClick={() =>
                              form.setValue(
                                // @ts-expect-error
                                key,
                                values.filter((x) => x !== v),
                              )
                            }
                            className="ml-1 size-5 p-0"
                          >
                            <XIcon className="size-4" />
                            <span className="sr-only">Remover</span>
                          </Button>
                        </Badge>
                      ))}
                    </Fragment>
                  )
                })}
                {/* If has filters, show clear button */}
                {Object.entries(filterParams).some(([key, values]) => {
                  if (
                    key === 'search_query' ||
                    !values ||
                    !Array.isArray(values) ||
                    values.length === 0
                  )
                    return false

                  return true
                }) && (
                  <Button
                    mode="bleed"
                    tone="neutral"
                    onClick={() => {
                      // For some reason, I'm having to reset the form twice
                      // to clear all the filters. Once doesn't work 🤷
                      form.reset(
                        {},
                        {
                          keepDefaultValues: false,
                          keepValues: false,
                        },
                      )
                      form.reset(
                        {},
                        {
                          keepDefaultValues: false,
                          keepValues: false,
                        },
                      )
                    }}
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>
            <DialogContent className="max-w-[calc(100dvw_-_var(--page-padding-x))] rounded-md">
              <DialogHeader>
                <DialogTitle>Filtre os resultados</DialogTitle>
              </DialogHeader>
              <DialogBody className="space-y-2">
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
                <RangeFields />
              </DialogBody>
              <DialogFooter className="border-t">
                <DialogClose asChild>
                  <Button size="lg" mode="bleed" tone="neutral">
                    Buscar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </FormProvider>
      <div className="relative mt-2 space-y-6">
        <VegetablesGridWrapper>
          {isFetching && !isFetchingNextPage && (
            <div className="bg-background bg-opacity-50 absolute inset-0 flex items-center justify-center gap-3">
              <Carrot className="h-6 w-6 animate-spin" />
              Carregando...
            </div>
          )}
          {data?.pages?.map((page) => (
            <React.Fragment key={page.queryParams.offset}>
              {(page.vegetables || []).map((vegetable) => (
                <VegetableCard key={vegetable.id} vegetable={vegetable} />
              ))}
            </React.Fragment>
          ))}
          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-3 py-10">
              <Carrot className="h-6 w-6 animate-spin" />
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
    </main>
  )
}

const RANGE_DISPLAY_LABELS = {
  development_cycle: {
    label: 'Desenvolvimento',
    format: 'days',
  },
  height: {
    label: 'Altura',
    format: 'centimeters',
  },
  temperature: {
    label: 'Temperatura',
    format: 'temperature',
  },
} as const

function RangeFilterDisplay({
  filterKey,
  values,
}: {
  filterKey: string
  values: VegetablesSearchFormValue[keyof VegetablesSearchFormValue]
}) {
  const form = useFormContext<VegetablesSearchFormValue>()
  if (
    !(filterKey in RANGE_DISPLAY_LABELS) ||
    !Array.isArray(values) ||
    values.length !== 2 ||
    values.every((value) => typeof value !== 'number' || value === 0)
  )
    return null

  return (
    <Badge key={filterKey} variant="outline">
      {
        RANGE_DISPLAY_LABELS[filterKey as keyof typeof RANGE_DISPLAY_LABELS]
          .label
      }{' '}
      -{' '}
      {rangeValueToLabel(
        values as unknown as typeof RangeFormValue.Type,
        RANGE_DISPLAY_LABELS[filterKey as keyof typeof RANGE_DISPLAY_LABELS]
          .format,
      )}
      <Button
        size="icon"
        mode="bleed"
        tone="neutral"
        onClick={() =>
          form.setValue(
            // @ts-expect-error
            filterKey,
            undefined,
          )
        }
        className="ml-1 size-5 p-0"
      >
        <XIcon className="size-4" />
        <span className="sr-only">Remover</span>
      </Button>
    </Badge>
  )
}

function rangeValueToLabel(
  value: typeof RangeFormValue.Type | null | undefined,
  format: NumberFormat,
) {
  if (!value) return '\u200B'

  const [min, max] = value
  if (!min && !max) return '\u200B'

  let parts: (string | number)[] = []
  if (!min) {
    parts = ['até ', max as number]
  } else if (!max) {
    parts = ['a partir de ', min]
  } else {
    parts = ['de ', min, ' a ', max]
  }

  return parts
    .map((value) => {
      if (typeof value === 'string' || format === 'none') return value

      return formatNumber(value, format)
    })
    .join('')
}

function RangeFields() {
  const form = useFormContext<VegetablesSearchFormValue>()
  const development_cycle = form.watch('development_cycle')
  const height = form.watch('height')
  const temperature = form.watch('temperature')

  return (
    <>
      <Field
        form={form}
        name="development_cycle"
        label="Tempo de desenvolvimento"
        description={rangeValueToLabel(development_cycle, 'days')}
        render={({ field }) => (
          <SliderRangeInput field={field} min={0} max={765} step={10} />
        )}
      />
      <Field
        form={form}
        name="height"
        label="Altura adulta"
        description={rangeValueToLabel(height, 'centimeters')}
        render={({ field }) => (
          <SliderRangeInput
            field={field}
            min={0}
            max={MAX_ACCEPTED_HEIGHT / 2}
            step={20}
          />
        )}
      />
      <Field
        form={form}
        name="temperature"
        label="Temperatura ideal"
        description={rangeValueToLabel(temperature, 'temperature')}
        render={({ field }) => (
          <SliderRangeInput
            field={field}
            min={MIN_ACCEPTED_TEMPERATURE}
            max={MAX_ACCEPTED_TEMPERATURE}
            step={2.5}
          />
        )}
      />
    </>
  )
}
