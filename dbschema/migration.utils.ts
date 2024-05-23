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

export const USER_ID_MAP = {
	// Angie
	'user.bf33ab2e-8ea0-45b1-80ac-e5feb0ffb57d':
		'5e66878a-1929-11ef-bd5a-07926f01b7d1',
	// Henrique
	'user.5920fb11-218e-466b-b9b1-b562d326ff9b':
		'02b81d06-1927-11ef-9ba8-1f058bdea354',
	henrique: '02b81d06-1927-11ef-9ba8-1f058bdea354',
}
