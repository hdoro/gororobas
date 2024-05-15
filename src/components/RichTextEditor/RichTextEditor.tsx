'use client'

import { EditorContent, type JSONContent, useEditor } from '@tiptap/react'
import { useMemo } from 'react'
import FormatToolbar from './FormatToolbar'
import {
	type RichTextEditorThemeVariants,
	richTextEditorTheme,
} from './RichTextEditor.theme'
import { getTiptapExtensions } from './getTiptapExtensions'

export default function RichTextEditor(
	props: {
		placeholder: string
		maxLength?: number
		onChange: (editorState: JSONContent) => void
		editorState: JSONContent
	} & RichTextEditorThemeVariants,
) {
	const classes = richTextEditorTheme(props)

	const { placeholder } = props
	const extensions = useMemo(
		() => getTiptapExtensions({ classes, placeholder }),
		[placeholder, classes],
	)
	const editor = useEditor({
		extensions,
		content: props.editorState,
		onUpdate: ({ editor }) => {
			props.onChange(Object.assign({}, editor.getJSON(), { version: 1 }))
		},
	})

	return (
		<>
			{editor && <FormatToolbar editor={editor} />}
			<EditorContent editor={editor} className={classes.contentEditable()} />
		</>
	)
}
