'use client'

import { cn } from '@/utils/cn'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import {
	EditorContent,
	type JSONContent,
	mergeAttributes,
	useEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useMemo } from 'react'
import FormatToolbar from './FormatToolbar'
import MentionSuggestions from './MentionSuggestions'
import {
	type RichTextEditorThemeVariants,
	richTextEditorTheme,
} from './RichTextEditor.theme'

export default function RichTextEditor(
	props: {
		placeholder: string
		maxLength?: number
		onChange: (editorState: JSONContent) => void
		editorState: JSONContent
	} & RichTextEditorThemeVariants,
) {
	const classes = richTextEditorTheme(props)

	const extensions = useMemo(
		() => [
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
				placeholder: props.placeholder,
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
		],
		[props.placeholder, classes],
	)
	const editor = useEditor({
		extensions,
		content: props.editorState,
		onUpdate: ({ editor }) => {
			props.onChange(editor.getJSON())
		},
	})

	return (
		<>
			{editor && <FormatToolbar editor={editor} />}
			<EditorContent editor={editor} className={classes.contentEditable()} />
		</>
	)
}
