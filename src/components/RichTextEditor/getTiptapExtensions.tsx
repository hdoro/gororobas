import { cn } from '@/utils/cn'
import Link from '@tiptap/extension-link'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import { mergeAttributes } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MentionSuggestions from './MentionSuggestions'
import type { richTextEditorTheme } from './RichTextEditor.theme'

export function getTiptapExtensions({
	classes,
	placeholder,
}: { classes: ReturnType<typeof richTextEditorTheme>; placeholder?: string }) {
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
			emptyEditorClass: cn('tiptap-placeholder', classes.placeholder()),
		}),
		Mention.configure({
			suggestion: MentionSuggestions,
			renderHTML: ({ options, node }) => {
				return [
					'span',
					mergeAttributes(
						{ className: 'font-semibold' },
						options.HTMLAttributes,
					),
					`${options.suggestion.char}${node.attrs.label}`,
				]
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
