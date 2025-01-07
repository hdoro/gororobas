'use client'

import useGlobalKeyDown from '@/hooks/useGlobalKeyDown'
import {
  RichTextMentionAttributes,
  type RichTextMentionAttributesInForm,
} from '@/schemas'
import { Schema } from 'effect'
import { SanityImage } from '../SanityImage'
import Carrot from '../icons/Carrot'
import { Button } from '../ui/button'
import { Text } from '../ui/text'
import ResponsiveFloater from './ResponsiveFloater'
import { findMentionMatch } from './findSuggestionMatch'
import type { EditorUIProps } from './tiptapStateMachine'
import useMentionOptions from './useMentionOptions'

export default function MentionList({
  editor,
  editorId,
  send,
  bottomOffset,
}: EditorUIProps) {
  const match = findMentionMatch(editor.state.selection.$from)
  const query = match?.query || ''

  const {
    arrowHandler,
    byObjectType,
    containerRef,
    isLoading,
    matches,
    selectedItem,
    selection,
  } = useMentionOptions(query)

  const selectItem = (id: string) => {
    const item = matches.find((item) => item.id === id)

    if (item && match) {
      const range = match.range
      const nodeAfter = editor.view.state.selection.$to.nodeAfter
      const overrideSpace = nodeAfter?.text?.startsWith(' ')

      if (overrideSpace) {
        range.to += 1
      }

      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: 'mention',
            attrs: Schema.decodeSync(RichTextMentionAttributes)({
              data: {
                id: item.id,
                version: 1,
                label: item.label,
                objectType: item.objectType,
                image:
                  item.image as RichTextMentionAttributesInForm['data']['image'],
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

  useGlobalKeyDown(
    (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        event.stopPropagation()
        arrowHandler('up', event)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        event.stopPropagation()
        arrowHandler('down', event)
      }
    },
    [arrowHandler],
  )

  useGlobalKeyDown(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        if (selectedItem?.id) selectItem(selectedItem.id)
      }
    },
    [selectedItem, selectItem],
    { capture: true },
  )

  return (
    <ResponsiveFloater
      editor={editor}
      editorId={editorId}
      bottomOffset={bottomOffset}
      className="max-h-[30dvh] overflow-y-auto overflow-x-hidden p-2"
    >
      <div ref={containerRef} className="space-y-5">
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
