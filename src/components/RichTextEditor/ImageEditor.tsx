'use client'

import {
  ImageFormToDBTransformer,
  ImageInForm,
  RichTextImageAttributes,
  type StoredImageInFormType,
} from '@/schemas'
import { useFormWithSchema } from '@/utils/useFormWithSchema'
import type { JSONContent } from '@tiptap/react'
import { Effect, Schema, pipe } from 'effect'
import React, { useEffect } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
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
          title: 'Erro ao enviar foto',
          description: 'Confira se tem conexão à internet e tente novamente',
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
              <Text className="absolute inset-0 z-50 flex items-center justify-center gap-3 bg-white text-muted-foreground">
                <Carrot className="h-5 w-5 animate-spin" />
                <span className="animate-pulse">Subindo imagem...</span>
              </Text>
            )}
            <DialogHeader>
              <DialogTitle>Adicionar foto</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Field
                form={form}
                name="image"
                label="Foto"
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
                  Adicionar
                </Button>
              </div>
            </DialogBody>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
