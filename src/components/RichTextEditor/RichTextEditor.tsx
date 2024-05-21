'use client'

import { EditorContent, type JSONContent, useEditor } from '@tiptap/react'
import { useMemo } from 'react'
import FormatToolbar from './FormatToolbar'
import {
	type RichTextEditorThemeProps,
	richTextEditorTheme,
} from './RichTextEditor.theme'
import { getTiptapExtensions } from './getTiptapExtensions'

export default function RichTextEditor(
	props: {
		placeholder: string
		maxLength?: number
		onChange: (editorState: JSONContent) => void
		editorState: JSONContent
		disabled?: boolean
		characterLimit?: number | undefined
	} & RichTextEditorThemeProps,
) {
	const classes = richTextEditorTheme(props)

	const { placeholder, characterLimit } = props
	const extensions = useMemo(
		() =>
			getTiptapExtensions({
				classes,
				placeholder,
				characterLimit,
			}),
		[placeholder, classes, characterLimit],
	)
	const editor = useEditor({
		extensions,
		content: props.editorState,
		onUpdate: ({ editor }) => {
			props.onChange(Object.assign({}, editor.getJSON(), { version: 1 }))
		},
		editable: props.disabled !== true,
	})

	return (
		<>
			{editor && <FormatToolbar editor={editor} />}
			<EditorContent
				editor={editor}
				className={classes.contentEditable({ className: 'tiptap-wrapper' })}
				data-placeholder={props.placeholder}
			/>
		</>
	)
}
