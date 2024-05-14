import { type VariantProps, tv } from 'tailwind-variants'

export const richTextEditorTheme = tv({
	slots: {
		root: 'grid grid-rows-1 grid-cols-1',
		contentEditable: 'outline-none caret-primary-700 first-child:space-y-6',
		placeholder:
			'pointer-events-none row-start-1 row-end-1 col-start-1 col-end-1',
		tiptapStrikethrough: 'strikethrough',
		tiptapItalic: 'italic',
		tiptapBold: '',
		tiptapListUl: 'list-disc pl-[1em] space-y-[0.25em]',
		tiptapListOl: 'list-decimal pl-[1em] space-y-[0.25em]',
	},
	variants: {
		type: {
			noteTitle: {
				contentEditable: 'text-2xl font-semibold text-gray-800',
				placeholder: 'text-2xl font-semibold text-gray-600',
				tiptapBold: 'font-bold',
			},
			noteBody: {
				contentEditable: 'text-xl font-normal text-gray-700',
				placeholder: 'text-xl font-normal text-gray-500',
				tiptapBold: 'font-semibold',
			},
			formTextarea: {
				contentEditable:
					'min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-tight ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-normal',
				placeholder: 'pt-0.5 text-sm text-muted-foreground font-normal',
				tiptapBold: 'font-semibold',
			},
		},
	},
})

export type RichTextEditorThemeVariants = VariantProps<
	typeof richTextEditorTheme
>
