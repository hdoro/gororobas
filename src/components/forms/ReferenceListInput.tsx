import { useQuery } from '@tanstack/react-query'
import { CommandLoading, defaultFilter } from 'cmdk'
import { CheckIcon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form'
import { listReferenceOptions } from '@/actions/listReferenceOptions'
import { m } from '@/paraglide/messages'
import type {
  ReferenceObjectType,
  ReferenceOption,
  ReferenceValueType,
} from '@/types'
import { cn } from '@/utils/cn'
import LoadingSpinner from '../LoadingSpinner'
import { SanityImage } from '../SanityImage'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { FormControl, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { Text } from '../ui/text'

const LABELS = {
  Tag: {
    searchTitle: 'Busque por etiquetas',
    empty: 'Nenhuma classificação encontrada',
  },
  Vegetable: {
    searchTitle: 'Busque por vegetais',
    empty: 'Nenhum vegetal encontrado',
  },
  UserProfile: {
    searchTitle: 'Busque por pessoas no Gororobas',
    empty: 'Nenhuma pessoa encontrada',
  },
} as const satisfies Record<
  ReferenceObjectType,
  { searchTitle: string; empty: string }
>

export default function ReferenceListInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  objectTypes,
  valueType = 'id',
  layout = 'combobox',
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  objectTypes: ReferenceObjectType[]
  valueType?: ReferenceValueType
  layout?: 'combobox' | 'list'
}) {
  const [focused, setFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const selected = (field.value || []) as ReferenceOption['value'][]
  const { options, optionsMap } = useReferenceOptions(objectTypes, valueType)

  function toggleOption(id: string) {
    if (selected.includes(id)) {
      field.onChange(selected.filter((selectedId) => selectedId !== id))
    } else {
      field.onChange([...selected, id])
      setSearchQuery('')
    }
  }

  const selectedOptions = selected.flatMap((id) => optionsMap[id] || [])

  const labels = LABELS[objectTypes[0]]

  if (layout === 'list') {
    const filteredOptions = options
      ?.flatMap((option) => {
        const score = defaultFilter(option.label, searchQuery, option.keywords)
        if (score === 0) return []

        return [{ option, score }]
      })
      .sort((a, b) => b.score - a.score)
      .map(({ option }) => option)

    return (
      <>
        {!options && <LoadingSpinner />}
        {options && (
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={labels.searchTitle}
            className="w-full"
          />
        )}
        {selectedOptions.length > 0 && (
          <div className="hide-scrollbar -mx-2 mt-4 flex min-h-10 gap-2 overflow-auto px-2">
            {
              // Reverse the array to keep the latest additions first,
              // which makes it easier for users to react to misselections
              [...selectedOptions].reverse().map((option) => {
                return (
                  <Badge
                    key={option.value}
                    size="sm"
                    className={cn('py-1', option.image ? 'px-1' : 'px-2')}
                  >
                    {option.image && (
                      <SanityImage
                        image={option.image}
                        maxWidth={24}
                        className="block h-6 w-6 rounded-full object-cover"
                        alt={`Foto de ${option.label}`}
                      />
                    )}
                    <span className="pr-1">{option.label}</span>
                    <button
                      className="button cursor-pointer rounded-full"
                      type="button"
                      onClick={() => toggleOption(option.value)}
                      disabled={field.disabled}
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </Badge>
                )
              })
            }
          </div>
        )}

        {filteredOptions?.length === 0 && (
          <Text level="sm" className="text-muted-foreground pt-4 text-center">
            {labels.empty}
          </Text>
        )}
        <div className="hide-scrollbar overflow-auto pt-2">
          {filteredOptions?.map((option) => (
            <Button
              key={option.value}
              mode="bleed"
              tone="neutral"
              onClick={() => toggleOption(option.value)}
              type="button"
              disabled={field.disabled}
              className="flex w-full justify-start"
            >
              {option.image && (
                <SanityImage
                  image={option.image}
                  maxWidth={24}
                  className="block h-6 w-6 rounded-full object-cover"
                  alt={m.gaudy_fluffy_fox_intend({ label: option.label })}
                />
              )}
              <span>{option.label}</span>
              {selected.includes(option.value) && (
                <CheckIcon className="h-4 w-4" />
              )}
            </Button>
          ))}
        </div>
      </>
    )
  }

  return (
    <FormItem className={'rounded-md border'}>
      <Command
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="relative overflow-visible p-0"
      >
        <FormLabel className="sr-only font-normal">
          {labels.searchTitle}
        </FormLabel>
        <FormControl>
          <CommandInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder={labels.searchTitle}
            className="border-none p-0"
            disabled={field.disabled}
          />
        </FormControl>
        <CommandList
          className={cn(
            'bg-card absolute top-full left-0 z-10 w-full translate-y-2 rounded-md border p-2',
            focused && !field.disabled ? '' : 'sr-only',
          )}
        >
          {!options && (
            <CommandLoading>
              <LoadingSpinner />
            </CommandLoading>
          )}
          {options && (
            <CommandEmpty className="flex items-center gap-2">
              {labels.empty}
            </CommandEmpty>
          )}
          {options?.map((option) => (
            <CommandItem
              key={option.value}
              className="flex items-center gap-2"
              value={option.value}
              keywords={[option.label, ...(option.keywords || [])]}
              onSelect={toggleOption}
            >
              {option.image && (
                <SanityImage
                  image={option.image}
                  maxWidth={24}
                  className="block h-6 w-6 rounded-full object-cover"
                  alt={m.gaudy_fluffy_fox_intend({ label: option.label })}
                />
              )}
              <span>{option.label}</span>
              {selected.includes(option.value) && (
                <CheckIcon className="h-4 w-4" />
              )}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
      {selectedOptions.length > 0 && (
        <div className="flex min-h-10 flex-wrap gap-2 p-2">
          {selectedOptions.map((option) => {
            return (
              <div
                key={option.value}
                className={cn(
                  'flex h-9 items-center gap-2 rounded-full border-2 py-1 text-sm',
                  option.image ? 'px-1' : 'px-2',
                )}
              >
                {option.image && (
                  <SanityImage
                    image={option.image}
                    maxWidth={24}
                    className="block h-6 w-6 rounded-full object-cover"
                    alt={m.gaudy_fluffy_fox_intend({ label: option.label })}
                  />
                )}
                <span className="pr-1">{option.label}</span>
                <button
                  className="button cursor-pointer rounded-full"
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  disabled={field.disabled}
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </FormItem>
  )
}

export function useReferenceOptions(
  objectTypes: ReferenceObjectType[],
  valueType: ReferenceValueType = 'id',
) {
  const result = useQuery({
    queryKey: ['useReferenceOptions', objectTypes.sort().join(',')],
    queryFn: () => listReferenceOptions(objectTypes, valueType),
    enabled: true,
  })

  const optionsMap = useMemo(() => {
    if (!result.data || !Array.isArray(result.data)) return {}

    return (result.data || []).reduce(
      (acc, option) => {
        acc[option.value] = option
        return acc
      },
      {} as Record<string, ReferenceOption>,
    )
  }, [result.data])

  return {
    ...result,
    optionsMap,
    options: Array.isArray(result.data) ? result.data : null,
    error: result.data && !Array.isArray(result.data) ? result.error : null,
  }
}
