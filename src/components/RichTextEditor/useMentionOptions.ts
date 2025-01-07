import type { ReferenceObjectType, ReferenceOption } from '@/types'
import { matchSorter } from 'match-sorter'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useReferenceOptions } from '../forms/ReferenceListInput'

const OBJECT_TYPES: ReferenceObjectType[] = ['UserProfile', 'Vegetable']

type Selection = {
  index: number
  objectType: ReferenceObjectType
}

export default function useMentionOptions(query: string) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [selection, setSelection] = useState({
    index: 0,
    objectType: 'UserProfile' as ReferenceObjectType,
  })
  const { options, isLoading } = useReferenceOptions(OBJECT_TYPES)

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
  }, [query])

  const selectedItem = byObjectType[selection.objectType]?.[selection.index]

  // Scroll to selected item when it changes
  useEffect(() => {
    if (selectedItem?.id)
      containerRef?.current
        ?.querySelector?.(`[data-id="${selectedItem?.id}"]`)
        ?.scrollIntoView({ block: 'nearest' })
  }, [selectedItem])

  const arrowHandler = (direction: 'up' | 'down', event: KeyboardEvent) =>
    setSelection(
      parseNextSelection({
        direction,
        byObjectType,
        selection,
        // If pressing CMD on Mac or CTRL on Windows skip list to the end
        skipWholeList: event.metaKey || event.ctrlKey,
      }),
    )

  return {
    arrowHandler,
    byObjectType,
    containerRef,
    isLoading,
    matches,
    selectedItem,
    selection,
  }
}

function parseNextSelection({
  direction,
  byObjectType,
  selection: current,
  skipWholeList,
}: {
  direction: 'up' | 'down'
  byObjectType: Record<ReferenceObjectType, ReferenceOption[]>
  selection: Selection
  skipWholeList: boolean
}): Selection {
  const objectTypeIndex = OBJECT_TYPES.findIndex(
    (objectType) => objectType === current.objectType,
  )
  const objectTypesWithItems = OBJECT_TYPES.filter(
    (objectType) => byObjectType[objectType].length > 0,
  )

  if (skipWholeList) {
    if (direction === 'up') {
      return {
        index: 0,
        objectType: objectTypesWithItems[objectTypeIndex],
      }
    }

    if (direction === 'down') {
      return {
        index: byObjectType[current.objectType].length - 1,
        objectType: objectTypesWithItems[objectTypeIndex],
      }
    }
  }

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
