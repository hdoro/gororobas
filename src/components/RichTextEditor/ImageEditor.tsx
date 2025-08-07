'use client'

import type { JSONContent } from '@tiptap/react'
import { Effect, pipe, Schema } from 'effect'
import React, { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import { m } from '@/paraglide/messages'
import {
  ImageFormToDBTransformer,
  ImageInForm,
  RichTextImageAttributes,
  type StoredImageInFormType,
} from '@/schemas'
import { useFormWithSchema } from '@/utils/useFormWithSchema'
import Field from '../forms/Field'
import ImageInput from '../forms/ImageInput'
import Carrot from '../icons/Carrot'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Text } from '../ui/text'
import { useToast } from '../ui/use-toast'
import type { EditorUIProps } from './tiptapStateMachine'

const formSchema = Schema.Struct({
  image: ImageInForm,
})

export function getImageTiptapContent(image: StoredImageInFormType) {
  return {
    type: 'image',
    attrs: Schema.decodeSync(RichTextImageAttributes)({
      data: { version: 1, image },
    }),
  } satisfies JSONContent
}

export default function ImageEditor({ editor, editorId, send }: EditorUIProps) {
  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const form = useFormWithSchema({
    schema: Schema.encodedBoundSchema(formSchema),
    disabled: !editor.isEditable,
  })

  // When first mounting, focus on the input
  useEffect(() => {
    imageInputRef?.current?.focus?.()
  }, [])

  const onSubmit: SubmitHandler<typeof formSchema.Type> = async (data) => {
    const program = pipe(
      // Upload the image
      Schema.decode(ImageFormToDBTransformer)(data.image),
      // And then insert it
      Effect.andThen((image) => {
        editor
          .chain()
          .focus()
          .createParagraphNear()
          .insertContent([
            {
              type: 'text',
              text: ' ',
            },
            getImageTiptapContent(image),
          ])
          .run()
        send({ type: 'ESCAPE' })
      }),
      Effect.catchAll(() => {
        toast({
          title: m.minor_icy_dachshund_exhale(),
          description: m.steep_sharp_mammoth_succeed(),
          variant: 'destructive',
        })
        return Effect.succeed({ error: 'upload-error' } as const)
      }),
    )

    await Effect.runPromise(program)
  }

  return (
    <Dialog
      open={true}
      onOpenChange={() => {
        if (form.formState.isSubmitting) return

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
            className="image-editor max-w-4xl flex-1 space-y-4"
            aria-disabled={form.formState.disabled}
          >
            {form.formState.isSubmitting && (
              <Text className="text-muted-foreground absolute inset-0 z-50 flex items-center justify-center gap-3 bg-white">
                <Carrot className="h-5 w-5 animate-spin" />
                <span className="animate-pulse">
                  {m.tiny_each_zebra_mend()}
                </span>
              </Text>
            )}
            <DialogHeader>
              <DialogTitle>Adicionar foto</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Field
                form={form}
                name="image"
                label={m.mad_left_nils_roar()}
                render={({ field }) => (
                  <ImageInput field={field} includeMetadata={false} />
                )}
              />
              <div className="mt-4 flex flex-row-reverse items-center justify-start gap-3">
                <Button
                  size="sm"
                  type="submit"
                  disabled={
                    form.formState.disabled || form.formState.isSubmitting
                  }
                >
                  {m.livid_topical_fish_renew()}
                </Button>
              </div>
            </DialogBody>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
