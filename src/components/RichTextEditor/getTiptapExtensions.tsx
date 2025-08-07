import { cn } from '@/utils/cn'
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
      link: {
        openOnClick: false,
        HTMLAttributes: {
          class: classes.tiptapLink(),
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
    Mention.configure(),
    Video.configure(),
    Image.configure(),
  ]
}
