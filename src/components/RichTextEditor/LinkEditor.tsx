'use client'

import { Schema } from 'effect'
import { TrashIcon } from 'lucide-react'
import React, { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { m } from '@/paraglide/messages'
import { useFormWithSchema } from '@/utils/useFormWithSchema'
import Field from '../forms/Field'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Input } from '../ui/input'
import type { EditorUIProps } from './tiptapStateMachine'

const formSchema = Schema.Struct({
  href: Schema.URL,
})

export default function LinkEditor({ editor, editorId, send }: EditorUIProps) {
  const linkInputRef = React.useRef<HTMLInputElement>(null)
  const form = useFormWithSchema({
    schema: formSchema,
    defaultValues: {
      href: editor.isActive('link') ? editor.getAttributes('link').href : '',
    },
    disabled:
      !editor.isEditable ||
      !editor.can().chain().focus().toggleLink({ href: '' }).run(),
  })

  // When first mounting, focus on the input
  useEffect(() => {
    linkInputRef?.current?.focus?.()
  }, [])

  const onSubmit: SubmitHandler<typeof formSchema.Type> = (data) => {
    const isExistingLink = editor.isActive('link')
    editor
      .chain()
      .focus()
      .extendMarkRange('link') // select the entire link
      .setLink({ href: data.href.toString() })
      .run()

    const { from, to } = editor.state.selection

    // If no text at selection, insert the entire link
    if (
      !isExistingLink &&
      editor.state.doc.textBetween(from, to).length === 0
    ) {
      editor.commands.insertContent(data.href.toString())
    }

    send({ type: 'ESCAPE' })
  }

  const deleteLink = () => {
    editor
      .chain()
      .focus()
      .extendMarkRange('link') // select the entire link
      .unsetLink()
      .run()
    send({ type: 'ESCAPE' })
  }

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
        <FormProvider {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation()
              form.handleSubmit(onSubmit)(e)
            }}
            className="max-w-4xl flex-1 space-y-4"
            aria-disabled={form.formState.disabled}
          >
            <DialogHeader>
              <DialogTitle>{m.close_slimy_cowfish_hunt()}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Field
                form={form}
                name="href"
                label="Link (URL)"
                render={({ field }) => (
                  <Input
                    {...field}
                    value={field.value?.toString?.() || ''}
                    type="url"
                  />
                )}
              />
              <div className="mt-4 flex flex-row-reverse items-center justify-start gap-3">
                <Button
                  size="sm"
                  type="submit"
                  disabled={form.formState.disabled}
                >
                  {m.petty_born_termite_jump()}
                </Button>
                <Button
                  onClick={deleteLink}
                  tone="destructive"
                  mode="bleed"
                  size="sm"
                >
                  <TrashIcon className="mr-2" /> {m.just_just_fireant_dart()}
                </Button>
              </div>
            </DialogBody>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
