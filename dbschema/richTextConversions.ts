import type { RichText } from '@/schemas'
import { toHTML } from '@portabletext/to-html'
import Link from '@tiptap/extension-link'
import { generateJSON } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'

export function htmlToTiptap(html: string): typeof RichText.Type {
	const tiptapJSON = generateJSON(html, [StarterKit, Link])

	return {
		...tiptapJSON,
		version: 1,
	}
}

export default function ptToTiptap(content: any[]): typeof RichText.Type {
	return htmlToTiptap(toHTML(content))
}
