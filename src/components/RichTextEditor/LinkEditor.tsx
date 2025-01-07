'use client'

import { TrashIcon } from 'lucide-react'
import React, { useEffect, useId } from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { EditorUIProps } from './tiptapStateMachine'

export default function LinkEditor({ editor, editorId, send }: EditorUIProps) {
  const linkInputRef = React.useRef<HTMLInputElement>(null)
  const id = useId()

  // When first mounting, focus on the input
  useEffect(() => {
    linkInputRef?.current?.focus?.()
  }, [])

  return (
    <Dialog
      open={true}
      onOpenChange={() => {
        send({ type: 'ESCAPE' })
        editor.commands.focus()
      }}
    >
      <DialogContent
        className="max-w-lg"
        hasClose={false}
        data-rich-editor-id={editorId}
      >
        <DialogHeader>
          <DialogTitle>Editar link</DialogTitle>
        </DialogHeader>
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
                editor.isActive('link') ? editor.getAttributes('link').href : ''
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
                send({ type: 'ESCAPE' })
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
  )
}
