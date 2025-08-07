import { tv, type VariantProps } from 'tailwind-variants'

export const richTextEditorTheme = tv({
  slots: {
    root: 'grid grid-rows-1 grid-cols-1',
    contentEditable: '*:outline-hidden *:caret-primary-700 *:space-y-6',
    placeholder:
      'pointer-events-none row-start-1 row-end-1 col-start-1 col-end-1',
    tiptapStrikethrough: 'strikethrough',
    tiptapItalic: 'italic',
    tiptapBold: '',
    tiptapListUl: 'tiptap--ul',
    tiptapListOl: 'tiptap--ol',
    tiptapListItem: 'tiptap--li',
    tiptapLink: 'link',
  },
  variants: {
    type: {
      noteTitle: {
        contentEditable: 'text-2xl font-semibold text-stone-800',
        placeholder: 'text-2xl font-semibold text-stone-600',
        tiptapBold: 'font-bold',
      },
      noteBody: {
        contentEditable:
          'text-xl font-normal text-stone-700 h-full note-body--content',
        placeholder: 'text-xl font-normal text-stone-500',
        tiptapBold: 'font-semibold',
      },
      formTextarea: {
        contentEditable:
          'text-sm leading-normal font-normal *:w-full rounded-md *:rounded-md *:border *:border-input *:bg-white *:px-3 *:py-2 *:ring-offset-background focus-within:outline-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:*:cursor-not-allowed disabled:*:opacity-50 min-h-[4lh] *:min-h-[4lh]',
        placeholder: 'pt-0.5 text-muted-foreground',
        tiptapBold: 'font-semibold',
      },
    },
  },
})

export type RichTextEditorThemeProps = VariantProps<typeof richTextEditorTheme>
