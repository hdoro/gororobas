'use client'

import type { ReferenceObjectType, ReferenceOption } from '@/types'
import type { SuggestionProps } from '@tiptap/suggestion'
import { matchSorter } from 'match-sorter'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { SanityImage } from '../SanityImage'
import { useReferenceOptions } from '../forms/ReferenceListInput'
import Carrot from '../icons/Carrot'
import { Button } from '../ui/button'
import { Text } from '../ui/text'

const OBJECT_TYPES: ReferenceObjectType[] = ['UserProfile', 'Vegetable']

type Selection = {
  index: number
  objectType: ReferenceObjectType
}

export default forwardRef<unknown, SuggestionProps<ReferenceOption, any>>(
  (props, ref) => {
    const [selection, setSelection] = useState({
      index: 0,
      objectType: 'UserProfile' as ReferenceObjectType,
    })
    const containerRef = useRef<HTMLDivElement>(null)
    const { options, isLoading } = useReferenceOptions(OBJECT_TYPES)

    const { query } = props
    const matches = useMemo(() => {
      if (!options?.length) return []
      if (!query) return options
      return matchSorter(options, query, { keys: ['label'] })
    }, [options, query])

    const byObjectType = useMemo(() => {
      return OBJECT_TYPES.reduce(
        (acc, objectType) => {
          acc[objectType] = (matches || []).filter(
            (option) => option.objectType === objectType,
          )
          return acc
        },
        {} as Record<ReferenceObjectType, ReferenceOption[]>,
      )
    }, [matches])

    // Reset selection when query changes
    // biome-ignore lint: really only run effect on query changes
    useEffect(() => {
      setSelection({
        index: 0,
        objectType:
          OBJECT_TYPES.find(
            (objectType) => byObjectType[objectType].length > 0,
          ) || OBJECT_TYPES[0],
      })
    }, [props.query])

    const selectedItem = byObjectType[selection.objectType]?.[selection.index]

    // Scroll to selected item when it changes
    useEffect(() => {
      if (selectedItem?.id)
        containerRef?.current
          ?.querySelector(`[data-id="${selectedItem?.id}"]`)
          ?.scrollIntoView({ block: 'nearest' })
    }, [selectedItem])

    const selectItem = (id: string) => {
      const item = matches.find((item) => item.id === id)

      if (item) {
        props.command({
          ...item,
          label: JSON.stringify({
            label: item.label,
            image: item.image,
            objectType: item.objectType,
          }),
        })
      }
    }

    const arrowHandler = (direction: 'up' | 'down') =>
      setSelection(
        parseNextSelection({
          direction,
          byObjectType,
          selection,
        }),
      )

    const enterHandler = () => {
      if (selectedItem?.id) selectItem(selectedItem?.id)
    }

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          arrowHandler('up')
          return true
        }

        if (event.key === 'ArrowDown') {
          arrowHandler('down')
          return true
        }

        if (event.key === 'Enter') {
          enterHandler()
          return true
        }

        return false
      },
    }))

    return (
      <div
        className="max-h-[30dvh] space-y-5 overflow-y-auto overflow-x-hidden rounded-md border bg-white p-2 shadow-sm"
        ref={containerRef}
      >
        {isLoading ? (
          <Text className="flex h-full items-center justify-center gap-3 text-muted-foreground">
            <Carrot className="h-5 w-5 animate-spin" />
            <span className="animate-pulse">Carregando menções...</span>
          </Text>
        ) : matches.length ? (
          Object.entries(byObjectType).map(([objectType, items]) => {
            if (!items.length) return null

            return (
              <div className="space-y-2" key={objectType}>
                <Text level="sm" className="px-3 text-muted-foreground">
                  {objectType === 'UserProfile' ? 'Pessoas' : 'Vegetais'}
                </Text>
                <div className="flex flex-col">
                  {items.map((item, itemIndex) => (
                    <Button
                      key={item.id}
                      tone="neutral"
                      mode={
                        selection.objectType === objectType &&
                        selection.index === itemIndex
                          ? 'outline'
                          : 'bleed'
                      }
                      onClick={() => selectItem(item.id)}
                      type="button"
                      size="sm"
                      className="!justify-start"
                      data-id={item.id}
                    >
                      {item.image && (
                        <SanityImage
                          image={item.image}
                          alt={item.label}
                          className="size-6 rounded-full"
                          maxWidth={24}
                        />
                      )}{' '}
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Nenhuma pessoa ou vegetal encontrado
          </div>
        )}
      </div>
    )
  },
)

function parseNextSelection({
  direction,
  byObjectType,
  selection: current,
}: {
  direction: 'up' | 'down'
  byObjectType: Record<ReferenceObjectType, ReferenceOption[]>
  selection: Selection
}): Selection {
  const objectTypeIndex = OBJECT_TYPES.findIndex(
    (objectType) => objectType === current.objectType,
  )
  const objectTypesWithItems = OBJECT_TYPES.filter(
    (objectType) => byObjectType[objectType].length > 0,
  )

  if (direction === 'up') {
    if (current.index === 0) {
      const newObjectType =
        objectTypeIndex === 0
          ? objectTypesWithItems.slice(-1)[0]
          : objectTypesWithItems[objectTypeIndex - 1]
      return {
        index: byObjectType[newObjectType].length - 1,
        objectType: newObjectType,
      }
    }

    return {
      index: current.index - 1,
      objectType: current.objectType,
    }
  }

  if (direction === 'down') {
    if (current.index === byObjectType[current.objectType].length - 1) {
      const newObjectType =
        objectTypeIndex === OBJECT_TYPES.length - 1
          ? objectTypesWithItems[0]
          : objectTypesWithItems[objectTypeIndex + 1]
      return {
        index: 0,
        objectType: newObjectType,
      }
    }

    return {
      index: current.index + 1,
      objectType: current.objectType,
    }
  }

  return current
}
