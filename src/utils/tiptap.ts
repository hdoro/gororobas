import { richTextEditorTheme } from '@/components/RichTextEditor/RichTextEditor.theme'
import { getTiptapExtensions } from '@/components/RichTextEditor/getTiptapExtensions'
import { RichText } from '@/schemas'
import type { TiptapNode } from '@/types'
import { Schema } from '@effect/schema'
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

export function isRenderableRichText(
	json: unknown,
): json is typeof RichText.Type {
	return (
		// Must be a TipTap object
		Schema.is(RichText)(json) &&
		// Have content
		!!json.content &&
		// Of at least one element
		(json.content.length > 1 ||
			// Which is either not a paragraph
			json.content[0].type !== 'paragraph' ||
			// Or has some text
			!!tiptapJSONtoPlainText(json))
	)
}
