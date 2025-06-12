'use client'

import { m } from '@/paraglide/messages'
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
  bottomOffset,
}: EditorUIProps) {
  return (
    <ResponsiveFloater
      editor={editor}
      className="flex gap-2"
      editorId={editorId}
      bottomOffset={bottomOffset}
    >
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        mode={editor.isActive('bold') ? 'outline' : 'bleed'}
        size="icon"
        aria-label={m.aqua_blue_rabbit_delight()}
      >
        <BoldIcon />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        mode={editor.isActive('italic') ? 'outline' : 'bleed'}
        size="icon"
        aria-label={m.inner_plane_finch_seek()}
      >
        <ItalicIcon />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        mode={editor.isActive('strike') ? 'outline' : 'bleed'}
        size="icon"
        aria-label={m.slow_sharp_wombat_persist()}
      >
        <StrikethroughIcon />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        mode={editor.isActive('bulletList') ? 'outline' : 'bleed'}
        size="icon"
        aria-label={m.stout_novel_wolf_dust()}
      >
        <ListIcon />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        mode={editor.isActive('orderedList') ? 'outline' : 'bleed'}
        size="icon"
        aria-label={m.next_yummy_okapi_kick()}
      >
        <ListOrderedIcon />
      </Button>
      <Button
        onClick={() => send({ type: 'EDIT_LINK' })}
        disabled={!editor.can().chain().focus().toggleLink({ href: '' }).run()}
        mode={editor.isActive('link') ? 'outline' : 'bleed'}
        size="icon"
        aria-label={m.raw_heavy_antelope_clap()}
      >
        <LinkIcon />
      </Button>
    </ResponsiveFloater>
  )
}
