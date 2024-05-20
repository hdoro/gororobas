import { richTextEditorTheme } from '@/components/RichTextEditor/RichTextEditor.theme'
import { getTiptapExtensions } from '@/components/RichTextEditor/getTiptapExtensions'
import type { TiptapNode } from '@/types'
import { generateHTML } from '@tiptap/html'

function HTMLToPlainText(html: string) {
	return html.replace(/<\/?[^>]*>/g, '')
}

export function tiptapJSONtoPlainText(json: TiptapNode) {
	try {
		const html = generateHTML(
			json,
			getTiptapExtensions({ classes: richTextEditorTheme() }),
		)
		return HTMLToPlainText(html)
	} catch (error) {
		return undefined
	}
}
