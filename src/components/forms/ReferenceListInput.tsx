import {
  type ReferenceObjectType,
  listReferenceOptions,
} from '@/actions/listReferenceOptions'
import type { ReferenceOption } from '@/types'
import { cn } from '@/utils/cn'
import { CommandLoading } from 'cmdk'
import { CheckIcon, XIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form'
import { SanityImage } from '../SanityImage'
import Carrot from '../icons/Carrot'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { FormControl, FormItem, FormLabel } from '../ui/form'

export default function ReferenceListInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  objectType,
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  objectType: ReferenceObjectType
}) {
  const [focused, setFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const selected = (field.value || []) as ReferenceOption['id'][]
  const { options, optionsMap, error } = useReferenceOptions(objectType)

  function toggleOption(id: string) {
    if (selected.includes(id)) {
      field.onChange(selected.filter((selectedId) => selectedId !== id))
    } else {
      field.onChange([...selected, id])
      setSearchQuery('')
    }
  }

  const selectedOptions = selected.flatMap((id) => optionsMap[id] || [])

  const label = objectType === 'Vegetable' ? 'vegetais' : 'pessoas'
  return (
    <FormItem className={'rounded-md border'}>
      <Command
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="relative overflow-visible p-0"
      >
        <FormLabel className="sr-only font-normal">
          Busque por {label} no Gororobas
        </FormLabel>
        <FormControl>
          <CommandInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder={`Busque por ${label} no Gororobas`}
            className="border-none p-0"
            disabled={field.disabled}
          />
        </FormControl>
        <CommandList
          className={cn(
            'absolute left-0 top-full z-10 w-full translate-y-2 rounded-md border bg-card p-2',
            focused && !field.disabled ? '' : 'sr-only',
          )}
        >
          {!options && (
            <CommandLoading>
              <Carrot className="h-6 w-6 animate-spin" /> Carregando
            </CommandLoading>
          )}
          <CommandEmpty className="flex items-center gap-2">
            Nenhum vegetal encontrado
          </CommandEmpty>
          {options?.map((option) => (
            <CommandItem
              key={option.id}
              className="flex items-center gap-2"
              value={option.id}
              keywords={[option.label]}
              onSelect={toggleOption}
            >
              {option.image && (
                <SanityImage
                  image={option.image}
                  maxWidth={24}
                  className="block h-6 w-6 rounded-full object-cover"
                  alt={`Foto de ${option.label}`}
                />
              )}
              <span>{option.label}</span>
              {selected.includes(option.id) && (
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
                key={option.id}
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
                    alt={`Foto de ${option.label}`}
                  />
                )}
                <span className="pr-1">{option.label}</span>
                <button
                  className="button cursor-pointer rounded-full"
                  type="button"
                  onClick={() => toggleOption(option.id)}
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

function useReferenceOptions(objectType: ReferenceObjectType) {
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<ReferenceOption[] | null>(null)

  const optionsMap = useMemo(() => {
    return (options || []).reduce(
      (acc, option) => {
        acc[option.id] = option
        return acc
      },
      {} as Record<string, ReferenceOption>,
    )
  }, [options])

  const fetchOptions = useCallback(async () => {
    const fetchedOptions = await listReferenceOptions(objectType)
    if ('error' in fetchedOptions) {
      setError(fetchedOptions.error)
    } else {
      setOptions(fetchedOptions)
    }
  }, [objectType])

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  return {
    options,
    optionsMap,
    error,
  }
}
