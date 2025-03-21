/**
 * Adaptation of Tiptap's official mention extension
 * https://github.com/ueberdosis/tiptap/blob/develop/packages/extension-mention/src/mention.ts
 *
 * Major changes:
 * - different data structure - RichTextMentionData instead of `id` and `label`, which allows for images
 */

import {
  RichTextMentionAttributes,
  type RichTextMentionAttributesInDB,
} from '@/schemas'
import { getImageProps } from '@/utils/getImageProps'
import { Node, mergeAttributes } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { Schema } from 'effect'

const TRIGGER_CHAR = '@'

export type MentionOptions<
  SuggestionItem = any,
  Attrs extends Record<string, any> = RichTextMentionAttributesInDB,
> = {
  /**
   * The HTML attributes for a mention node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>

  /**
   * Whether to delete the trigger character with backspace.
   * @default false
   */
  deleteTriggerWithBackspace: boolean
}

export const MentionPluginKey = new PluginKey('mention')

export const Mention = Node.create<MentionOptions>({
  name: 'mention',

  priority: 101,

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      data: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-mention-data'),
        renderHTML: (attributes) => {
          if (!attributes.data) {
            return {}
          }

          return {
            'data-mention-data': attributes.data,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ]
  },

  renderHTML({ node }) {
    try {
      const { data } = Schema.encodeUnknownSync(RichTextMentionAttributes)(
        node.attrs,
      )

      const imageProps = data.image
        ? getImageProps({ image: data.image, maxWidth: 24 })
        : null
      return [
        'span',
        mergeAttributes(
          { class: 'font-medium text-primary-700 underline' },
          this.options.HTMLAttributes,
        ),
        ...(imageProps
          ? [
              [
                'img',
                {
                  ...imageProps,
                  alt: data.label,
                  class: 'size-6 rounded-full object-cover inline-block mr-1',
                  loading: 'lazy',
                },
              ],
            ]
          : [TRIGGER_CHAR]),
        data.label,
      ]
    } catch (error) {
      return ['span', {}, node.attrs.id]
    }
  },

  renderText({ node }) {
    try {
      const { data } = Schema.encodeUnknownSync(RichTextMentionAttributes)(
        node.attrs,
      )

      return TRIGGER_CHAR + data.label
    } catch (error) {
      return '(menção)'
    }
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          let isMention = false
          const { selection } = state
          const { empty, anchor } = selection

          if (!empty) {
            return false
          }

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isMention = true
              tr.insertText(
                this.options.deleteTriggerWithBackspace
                  ? ''
                  : TRIGGER_CHAR || '',
                pos,
                pos + node.nodeSize,
              )

              return false
            }
          })

          return isMention
        }),
    }
  },
})
