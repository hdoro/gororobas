'use client'

import { AtSignIcon, ImageUpIcon, LinkIcon, YoutubeIcon } from 'lucide-react'
import { m } from '@/paraglide/messages'
import { Button } from '../ui/button'
import ResponsiveFloater from './ResponsiveFloater'
import type { EditorUIProps } from './tiptapStateMachine'

export default function BlocksToolbar({
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
        onClick={() => send({ type: 'EDIT_LINK' })}
        disabled={!editor.can().chain().focus().toggleLink({ href: '' }).run()}
        mode={editor.isActive('link') ? 'outline' : 'bleed'}
        size="icon"
        aria-label={m.dirty_round_buzzard_empower()}
      >
        <LinkIcon />
      </Button>
      <Button
        onClick={() => {
          send({ type: 'EDIT_MENTION' })
          const isStartOfLine = editor.state.selection.$from.parentOffset === 0
          editor
            .chain()
            .focus()
            // Don't include a leading space if at the start of the line
            .insertContent(`${isStartOfLine ? '' : ' '}@`)
            .run()
        }}
        disabled={!editor.can().chain().focus().toggleLink({ href: '' }).run()}
        mode={editor.isActive('mention') ? 'outline' : 'bleed'}
        size="icon"
        aria-label={m.awake_wise_lobster_support()}
      >
        <AtSignIcon />
      </Button>
      <Button
        onClick={() => {
          send({ type: 'EDIT_IMAGE' })
        }}
        mode={editor.isActive('image') ? 'outline' : 'bleed'}
        size="icon"
        aria-label={m.merry_spare_bat_yell()}
      >
        <ImageUpIcon />
      </Button>
      <Button
        onClick={() => {
          send({ type: 'EDIT_VIDEO' })
        }}
        mode={editor.isActive('video') ? 'outline' : 'bleed'}
        size="icon"
        aria-label={m.mellow_white_grizzly_support()}
      >
        <YoutubeIcon />
      </Button>
    </ResponsiveFloater>
  )
}
