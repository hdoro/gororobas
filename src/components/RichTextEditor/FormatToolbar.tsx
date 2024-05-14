'use client'
import { cn } from '@/utils/cn'
import { BubbleMenu, type Editor } from '@tiptap/react'
import {
	BoldIcon,
	ItalicIcon,
	ListIcon,
	ListOrderedIcon,
	StrikethroughIcon,
} from 'lucide-react'
import { Button } from '../ui/button'

const FormatToolbar = ({ editor }: { editor: Editor }) => {
	return (
		<BubbleMenu
			editor={editor}
			tippyOptions={{ duration: 100 }}
			className={cn(
				'z-10 will-change-transform',
				'flex gap-2 p-3 shadow-md rounded-md bg-white border',
			)}
		>
			<Button
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				variant={editor.isActive('bold') ? 'outline' : 'ghost'}
				size="icon"
				aria-label="Negrito"
			>
				<BoldIcon />
			</Button>

			<Button
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				variant={editor.isActive('italic') ? 'outline' : 'ghost'}
				size="icon"
				aria-label="Itálico"
			>
				<ItalicIcon />
			</Button>
			<Button
				onClick={() => editor.chain().focus().toggleStrike().run()}
				disabled={!editor.can().chain().focus().toggleStrike().run()}
				variant={editor.isActive('strike') ? 'outline' : 'ghost'}
				size="icon"
				aria-label="Riscado"
			>
				<StrikethroughIcon />
			</Button>
			<Button
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				disabled={!editor.can().chain().focus().toggleBulletList().run()}
				variant={editor.isActive('bulletList') ? 'outline' : 'ghost'}
				size="icon"
				aria-label="Lista não ordenada"
			>
				<ListIcon />
			</Button>
			<Button
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				disabled={!editor.can().chain().focus().toggleOrderedList().run()}
				variant={editor.isActive('orderedList') ? 'outline' : 'ghost'}
				size="icon"
				aria-label="Lista numérica"
			>
				<ListOrderedIcon />
			</Button>
		</BubbleMenu>
	)
}

export default FormatToolbar
