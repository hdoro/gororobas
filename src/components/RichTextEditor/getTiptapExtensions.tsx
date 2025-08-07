import { cn } from '@/utils/cn'
import Link from '@tiptap/extension-link'
import { ListKeymap } from '@tiptap/extension-list'
import { Placeholder } from '@tiptap/extensions'
import type { Extensions } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Image } from './ImageExtension'
import { Mention } from './MentionExtension'
import type { richTextEditorTheme } from './RichTextEditor.theme'
import { Video } from './VideoExtension'

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
      listItem: {
        HTMLAttributes: {
          class: classes.tiptapListItem(),
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
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: classes.tiptapLink(),
      },
    }),
    Mention.configure(),
    Video.configure(),
    Image.configure(),
    ListKeymap.configure(),
  ]
}
