'use client'

import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  StrikethroughIcon,
} from 'lucide-react'
import { Button } from '../ui/button'
import ResponsiveFloater from './ResponsiveFloater'
import type { EditorUIProps } from './tiptapStateMachine'

export default function FormatToolbar({
  editor,
  editorId,
  send,
}: EditorUIProps) {
  return (
    <ResponsiveFloater
      editor={editor}
      className="flex justify-between gap-2"
      editorId={editorId}
    >
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        mode={editor.isActive('bold') ? 'outline' : 'bleed'}
        size="icon"
        aria-label="Negrito"
      >
        <BoldIcon />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        mode={editor.isActive('italic') ? 'outline' : 'bleed'}
        size="icon"
        aria-label="Itálico"
      >
        <ItalicIcon />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        mode={editor.isActive('strike') ? 'outline' : 'bleed'}
        size="icon"
        aria-label="Riscado"
      >
        <StrikethroughIcon />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        mode={editor.isActive('bulletList') ? 'outline' : 'bleed'}
        size="icon"
        aria-label="Lista não ordenada"
      >
        <ListIcon />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        mode={editor.isActive('orderedList') ? 'outline' : 'bleed'}
        size="icon"
        aria-label="Lista numérica"
      >
        <ListOrderedIcon />
      </Button>
      <Button
        onClick={() => send({ type: 'EDIT_LINK' })}
        disabled={!editor.can().chain().focus().toggleLink({ href: '' }).run()}
        mode={editor.isActive('link') ? 'outline' : 'bleed'}
        size="icon"
        aria-label="Link"
      >
        <LinkIcon />
      </Button>
    </ResponsiveFloater>
  )
}
