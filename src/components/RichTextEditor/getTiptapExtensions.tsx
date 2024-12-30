import { cn } from '@/utils/cn'
import { getImageProps } from '@/utils/getImageProps'
import Link from '@tiptap/extension-link'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import { type Extensions, mergeAttributes } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MentionSuggestions from './MentionSuggestions'
import type { richTextEditorTheme } from './RichTextEditor.theme'

/**
 * Does not include CharacterCount extension because it breaks server actions.
 */
export function getTiptapExtensions({
  classes,
  placeholder,
}: {
  classes: ReturnType<typeof richTextEditorTheme>
  placeholder?: string
}): Extensions {
  return [
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        HTMLAttributes: {
          class: classes.tiptapListUl(),
        },
      },
      orderedList: {
        keepMarks: true,
        HTMLAttributes: {
          class: classes.tiptapListOl(),
        },
      },
      bold: {
        HTMLAttributes: {
          class: classes.tiptapBold(),
        },
      },
      italic: {
        HTMLAttributes: {
          class: classes.tiptapItalic(),
        },
      },
      strike: {
        HTMLAttributes: {
          class: classes.tiptapStrikethrough(),
        },
      },
    }),
    Placeholder.configure({
      placeholder: placeholder || '',
      emptyEditorClass: cn(
        'tiptap-placeholder',
        classes.placeholder(),
      ) as string,
    }),
    Mention.configure({
      suggestion: MentionSuggestions,
      renderHTML: ({ options, node }) => {
        let label = node.attrs.label
        let imageProps: ReturnType<typeof getImageProps> | null = null
        try {
          // Tiptap/Prosemirror doesn't allow us to include custom data in mentions - only `id` and `label`
          // As a result, in MentionList we set the label as a JSON string (refer to @selectItem in that component)
          const labelAsJSON = JSON.parse(node.attrs.label)
          label = labelAsJSON.label
          imageProps = labelAsJSON.image
            ? getImageProps({ image: labelAsJSON.image, maxWidth: 24 })
            : null
        } catch (error) {}

        return [
          'span',
          mergeAttributes(
            { class: 'font-medium text-primary-700 underline' },
            options.HTMLAttributes,
          ),
          ...(imageProps
            ? [
                [
                  'img',
                  {
                    ...imageProps,
                    alt: label,
                    class: 'size-6 rounded-full object-cover inline-block mr-1',
                    loading: 'lazy',
                  },
                ],
              ]
            : [options.suggestion.char]),
          label,
        ]
      },
      renderText: ({ options, node }) => {
        let label = node.attrs.label
        try {
          const labelAsJSON = JSON.parse(node.attrs.label)
          label = labelAsJSON.label
        } catch (error) {}
        return options.suggestion.char + label
      },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: classes.tiptapLink(),
      },
    }),
  ]
}
