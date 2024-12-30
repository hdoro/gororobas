'use client'

import type { ReferenceObjectType, ReferenceOption } from '@/types'
import type { SuggestionProps } from '@tiptap/suggestion'
import { matchSorter } from 'match-sorter'
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { SanityImage } from '../SanityImage'
import { useReferenceOptions } from '../forms/ReferenceListInput'
import Carrot from '../icons/Carrot'
import { Button } from '../ui/button'
import { Text } from '../ui/text'

export default forwardRef<unknown, SuggestionProps<ReferenceOption, any>>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const objectTypes: ReferenceObjectType[] = ['UserProfile', 'Vegetable']
    const { options, isLoading } = useReferenceOptions(objectTypes)

    const { query } = props
    const matches = useMemo(() => {
      if (!options?.length) return []
      if (!query) return options
      return matchSorter(options, query, { keys: ['label'] })
    }, [options, query])

    const byOjbectType = useMemo(() => {
      return objectTypes.reduce(
        (acc, objectType) => {
          acc[objectType] = (matches || []).filter(
            (option) => option.objectType === objectType,
          )
          return acc
        },
        {} as Record<ReferenceObjectType, ReferenceOption[]>,
      )
    }, [matches])

    const selectItem = (index: number) => {
      const item = matches[index]

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

    const upHandler = () => {
      setSelectedIndex((selectedIndex + matches.length - 1) % matches.length)
    }

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % matches.length)
    }

    const enterHandler = () => {
      selectItem(selectedIndex)
    }

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          upHandler()
          return true
        }

        if (event.key === 'ArrowDown') {
          downHandler()
          return true
        }

        if (event.key === 'Enter') {
          enterHandler()
          return true
        }

        return false
      },
    }))

    if (isLoading) {
      return (
        <div className="flex flex-col rounded-md border bg-white p-2 shadow-sm">
          <div className="flex items-center justify-center gap-3">
            <Carrot className="h-6 w-6 animate-spin" />
            Carregando menções...
          </div>
        </div>
      )
    }

    return (
      <div
        className="space-y-5 overflow-y-auto rounded-md border bg-white p-2 shadow-sm"
        style={{
          maxHeight: `calc(80dvh - ${props.clientRect?.()?.top || 0}px)`,
        }}
      >
        {matches.length ? (
          Object.entries(byOjbectType).map(([objectType, items]) => {
            if (!items.length) return null

            return (
              <div className="space-y-2" key={objectType}>
                <Text level="sm" className="px-3 text-muted-foreground">
                  {objectType === 'UserProfile' ? 'Pessoas' : 'Vegetais'}
                </Text>
                <div className="flex flex-col">
                  {items.map((item, index) => (
                    <Button
                      key={item.id}
                      tone="neutral"
                      mode={index === selectedIndex ? 'outline' : 'bleed'}
                      onClick={() => selectItem(index)}
                      type="button"
                      size="sm"
                      className="!justify-start"
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
          <div className="text-sm text-muted-foreground">
            Nenhuma pessoa ou vegetal encontrado
          </div>
        )}
      </div>
    )
  },
)
