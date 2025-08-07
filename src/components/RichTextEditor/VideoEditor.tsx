'use client'

import type { JSONContent } from '@tiptap/react'
import { Schema } from 'effect'
import React, { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { m } from '@/paraglide/messages'
import {
  RichTextVideoAttributes,
  YoutubeVideoURL,
  type YoutubeVideoURLType,
} from '@/schemas'
import { useFormWithSchema } from '@/utils/useFormWithSchema'
import { getYouTubeID } from '@/utils/youtube'
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
  url: YoutubeVideoURL,
})

export function getVideoTiptapContent(url: YoutubeVideoURLType) {
  return {
    type: 'video',
    attrs: Schema.decodeSync(RichTextVideoAttributes)({
      data: { version: 1, type: 'youtube', id: getYouTubeID(url) },
    }),
  } satisfies JSONContent
}

export default function VideoEditor({ editor, editorId, send }: EditorUIProps) {
  const videoInputRef = React.useRef<HTMLInputElement>(null)

  const form = useFormWithSchema({
    schema: formSchema,
    disabled: !editor.isEditable,
  })

  // When first mounting, focus on the input
  useEffect(() => {
    videoInputRef?.current?.focus?.()
  }, [])

  const onSubmit: SubmitHandler<typeof formSchema.Type> = (data) => {
    editor
      .chain()
      .focus()
      .createParagraphNear()
      .insertContent([
        {
          type: 'text',
          text: ' ',
        },
        getVideoTiptapContent(data.url),
      ])
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
              <DialogTitle>{m.slimy_funny_tuna_favor()}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Field
                form={form}
                name="url"
                label="URL do vídeo no YouTube"
                render={({ field }) => (
                  <Input {...field} value={field.value || ''} type="url" />
                )}
              />
              <div className="mt-4 flex flex-row-reverse items-center justify-start gap-3">
                <Button
                  size="sm"
                  type="submit"
                  disabled={form.formState.disabled}
                >
                  {m.tasty_lazy_quail_endure()}
                </Button>
              </div>
            </DialogBody>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
