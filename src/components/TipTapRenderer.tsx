import type { RichText } from '@/schemas'
import { generateHTML } from '@tiptap/html'
import { getTiptapExtensions } from './RichTextEditor/getTiptapExtensions'
import { richTextEditorTheme } from './RichTextEditor/RichTextEditor.theme'

export default function TipTapRenderer({
	content,
}: { content: typeof RichText.Type }) {
	const classes = richTextEditorTheme({ type: 'formTextarea' })

	return (
		<div
			// biome-ignore lint: we need to use dangerouslySetInnerHTML to render HTML
			dangerouslySetInnerHTML={{
				__html: generateHTML(content, getTiptapExtensions({ classes })),
			}}
		/>
	)
}
