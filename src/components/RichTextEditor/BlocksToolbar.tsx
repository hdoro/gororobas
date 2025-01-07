'use client'

import useViewport from '@/hooks/useViewport'
import { cn } from '@/utils/cn'
import type { Editor } from '@tiptap/react'
import { AtSignIcon, ImageUpIcon, LinkIcon, YoutubeIcon } from 'lucide-react'
import { Button } from '../ui/button'
import type { TiptapStateMachine } from './tiptapStateMachine'

export default function BlocksToolbar({
  editor,
  send,
}: {
  editor: Editor
  send: TiptapStateMachine['send']
}) {
  const viewport = useViewport()

  return (
    <div
      className={cn(
        'transform-[translateY(var(--translate))] fixed inset-x-0 bottom-0 z-50 w-full origin-bottom-left',
        'md:sticky md:transform-none md:rounded-t-none',
        'rounded-t-md border-t bg-white p-3',
        'flex justify-between gap-2',
      )}
      style={{
        '--translate-y': `translateY(-${Math.round(
          viewport.window.height -
            (viewport.visualViewport?.height || 0) -
            viewport.visualViewport.offsetTop,
        )}px)`,
      }}
    >
      <Button
        onClick={() => send({ type: 'EDIT_LINK' })}
        disabled={!editor.can().chain().focus().toggleLink({ href: '' }).run()}
        mode={editor.isActive('link') ? 'outline' : 'bleed'}
        size="icon"
        aria-label="Link"
      >
        <LinkIcon />
      </Button>
      <Button
        onClick={() => {
          send({ type: 'EDIT_MENTION' })
          editor.chain().focus().setTextSelection(editor.state.selection).run()
        }}
        disabled={!editor.can().chain().focus().toggleLink({ href: '' }).run()}
        mode={editor.isActive('link') ? 'outline' : 'bleed'}
        size="icon"
        aria-label="Menções"
      >
        <AtSignIcon />
      </Button>
      <Button
        onClick={() => alert('Ainda não terminamos essa parte!')}
        disabled={true}
        mode={editor.isActive('image') ? 'outline' : 'bleed'}
        size="icon"
        aria-label="Imagem"
      >
        <ImageUpIcon />
      </Button>
      <Button
        onClick={() => {
          send({ type: 'EDIT_VIDEO' })
        }}
        mode={editor.isActive('video') ? 'outline' : 'bleed'}
        size="icon"
        aria-label="Video"
      >
        <YoutubeIcon />
      </Button>
    </div>
  )
}
