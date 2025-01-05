'use client'

import useViewport from '@/hooks/useViewport'
import { BubbleMenu, type Editor } from '@tiptap/react'
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  StrikethroughIcon,
  TrashIcon,
} from 'lucide-react'
import React, { useId } from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

const FormatToolbar = ({ editor }: { editor: Editor }) => {
  const linkInputRef = React.useRef<HTMLInputElement>(null)
  const viewport = useViewport()

  const id = useId()
  const [status, setStatus] = React.useState<'idle' | 'editing-link'>('idle')

  return (
    <>
      <BubbleMenu editor={editor} className="tippy-bottom-drawer">
        <div
          className="transform-[translateY(var(--tranlsate-y))] fixed inset-x-0 bottom-0 z-[1000] flex h-[73px] w-full origin-bottom-left justify-between gap-2 overflow-x-auto overflow-y-hidden rounded-md border bg-white p-3 shadow-md md:relative md:inset-auto md:bottom-auto md:h-auto md:w-auto md:transform-none"
          style={{
            '--translate-y': `-${Math.round(
              viewport.window.height -
                (viewport.visualViewport?.height || 0) -
                viewport.visualViewport.offsetTop,
            )}px`,
          }}
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
            onClick={() => setStatus('editing-link')}
            disabled={
              !editor.can().chain().focus().toggleLink({ href: '' }).run()
            }
            mode={editor.isActive('link') ? 'outline' : 'bleed'}
            size="icon"
            aria-label="Ícone"
          >
            <LinkIcon />
          </Button>
        </div>
      </BubbleMenu>
      {status === 'editing-link' && (
        <Dialog
          open={true}
          onOpenChange={() => {
            setStatus('idle')
            editor.commands.focus()
          }}
        >
          <DialogContent className="max-w-lg" hasClose={false}>
            <DialogHeader>Editar link</DialogHeader>
            <DialogBody>
              <div className="space-y-2">
                <Label
                  htmlFor={`link-${id}`}
                  aria-invalid={
                    editor.isActive('link') &&
                    !URL.canParse(editor.getAttributes('link').href)
                  }
                  className={
                    editor.isActive('link') &&
                    !URL.canParse(editor.getAttributes('link').href)
                      ? 'text-destructive'
                      : ''
                  }
                >
                  URL
                </Label>
                <Input
                  value={
                    editor.isActive('link')
                      ? editor.getAttributes('link').href
                      : ''
                  }
                  onChange={(e) =>
                    editor.commands.toggleLink({ href: e.target.value })
                  }
                  type="url"
                  id={`link-${id}`}
                  ref={linkInputRef}
                />
              </div>
              <div className="mt-4 flex flex-row-reverse items-center justify-start gap-3">
                <DialogTrigger
                  asChild
                  disabled={
                    editor.isActive('link') &&
                    !URL.canParse(editor.getAttributes('link').href)
                  }
                >
                  <Button size="sm">Salvar e fechar</Button>
                </DialogTrigger>
                <Button
                  onClick={() => {
                    setStatus('idle')
                    editor.commands.unsetLink()
                    editor.commands.focus()
                  }}
                  tone="destructive"
                  mode="bleed"
                  size="sm"
                >
                  <TrashIcon className="mr-2" /> Deletar link
                </Button>
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default FormatToolbar
