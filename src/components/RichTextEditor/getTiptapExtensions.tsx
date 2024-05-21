import { cn } from '@/utils/cn'
import CharacterCount from '@tiptap/extension-character-count'
import Link from '@tiptap/extension-link'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import { type Extensions, mergeAttributes } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MentionSuggestions from './MentionSuggestions'
import type { richTextEditorTheme } from './RichTextEditor.theme'

export function getTiptapExtensions({
	classes,
	placeholder,
	characterLimit,
}: {
	classes: ReturnType<typeof richTextEditorTheme>
	placeholder?: string
	characterLimit?: number | undefined
}) {
	const extensions: Extensions = [
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

	if (characterLimit) {
		extensions.push(
			CharacterCount.configure({
				limit: characterLimit,
			}),
		)
	}

	return extensions
}
