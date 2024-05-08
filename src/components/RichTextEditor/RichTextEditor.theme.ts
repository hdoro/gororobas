import { tv, type VariantProps } from 'tailwind-variants'

export const richTextEditorTheme = tv({
  slots: {
    root: 'grid grid-rows-1 grid-cols-1',
    contentEditableRoot: 'row-start-1 row-end-1 col-start-1 col-end-1',
    contentEditable: 'outline-none caret-primary-700',
    placeholder:
      'pointer-events-none row-start-1 row-end-1 col-start-1 col-end-1',
    lexicalStrikethrough: 'strikethrough',
    lexicalItalic: 'italic',
    lexicalBold: '',
  },
  variants: {
    type: {
      noteTitle: {
        contentEditableRoot: 'text-2xl font-semibold text-gray-800',
        placeholder: 'text-2xl font-semibold text-gray-600',
        lexicalBold: 'font-bold',
      },
      noteBody: {
        contentEditableRoot: 'text-xl font-normal text-gray-700',
        placeholder: 'text-xl font-normal text-gray-500',
        lexicalBold: 'font-semibold',
      },
      formTextarea: {
        contentEditableRoot: 'font-normal',
        contentEditable:
          'min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        placeholder: 'pt-2 pl-3 text-sm text-muted-foreground font-normal',
        lexicalBold: 'font-semibold',
      },
    },
  },
})

export type RichTextEditorThemeVariants = VariantProps<
  typeof richTextEditorTheme
>
