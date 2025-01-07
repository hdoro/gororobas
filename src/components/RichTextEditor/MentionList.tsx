'use client'

import useGlobalKeyDown from '@/hooks/useGlobalKeyDown'
import { RichTextMentionAttributes } from '@/schemas'
import type { ReferenceObjectType, ReferenceOption } from '@/types'
import { Schema } from 'effect'
import { matchSorter } from 'match-sorter'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SanityImage } from '../SanityImage'
import { useReferenceOptions } from '../forms/ReferenceListInput'
import Carrot from '../icons/Carrot'
import { Button } from '../ui/button'
import { Text } from '../ui/text'
import ResponsiveFloater from './ResponsiveFloater'
import type { EditorUIProps } from './tiptapStateMachine'

const OBJECT_TYPES: ReferenceObjectType[] = ['UserProfile', 'Vegetable']

type Selection = {
  index: number
  objectType: ReferenceObjectType
}

export default function MentionList({ editor, editorId, send }: EditorUIProps) {
  const [selection, setSelection] = useState({
    index: 0,
    objectType: 'UserProfile' as ReferenceObjectType,
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const { options, isLoading } = useReferenceOptions(OBJECT_TYPES)

  // @TODO: dynamic query, somehow
  const [query, _setQuery] = useState('')
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

  const selectItem = (id: string) => {
    const item = matches.find((item) => item.id === id)

    if (item) {
      // const match = findSuggestionMatch({
      //   char: '@',
      //   allowSpaces: false,
      //   allowToIncludeChar: false,
      //   allowedPrefixes: [],
      //   startOfLine: true,
      //   $position: editor.state.selection.$from,
      // })
      // console.log({ match, item })
      // if (!match) return

      // const { range } = match

      // // increase range.to by one when the next node is of type "text"
      // // and starts with a space character
      // const nodeAfter = editor.view.state.selection.$to.nodeAfter
      // const overrideSpace = nodeAfter?.text?.startsWith(' ')

      // if (overrideSpace) {
      //   range.to += 1
      // }
      editor
        .chain()
        .focus()
        .insertContentAt(editor.state.selection, [
          {
            type: 'mention',
            attrs: Schema.decodeSync(RichTextMentionAttributes)({
              data: {
                id: item.id,
                version: 1,
                label: item.label,
                objectType: item.objectType,
                image: item.image,
              },
            }),
          },
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run()

      editor.view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd()
    }

    send({
      type: 'ESCAPE',
    })
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

  useGlobalKeyDown(
    (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        arrowHandler('up')
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        arrowHandler('down')
      } else if (event.key === 'Enter') {
        event.preventDefault()
        enterHandler()
      }
    },
    [selectedItem],
  )

  return (
    <ResponsiveFloater
      editor={editor}
      editorId={editorId}
      className="max-h-[30dvh] space-y-5 overflow-y-auto overflow-x-hidden p-2"
    >
      <div ref={containerRef}>
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
    </ResponsiveFloater>
  )
}

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
