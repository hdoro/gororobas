'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ImageInForm,
  ResourceData,
  type ResourceForDBWithImages,
  type ResourceInForm,
  ResourceWithUploadedImages,
} from '@/schemas'
import { removeNullishKeys } from '@/utils/diffs'
import { generateId } from '@/utils/ids'
import {
  RESOURCE_FIELD_LABELS_MAP,
  RESOURCE_FORMAT_TO_LABEL,
} from '@/utils/labels'
import { useFormWithSchema } from '@/utils/useFormWithSchema'
import { Effect, Schema, pipe } from 'effect'
import { SendIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import Field from './forms/Field'
import ImageInput from './forms/ImageInput'
import RadioGroupInput from './forms/RadioGroupInput'
import ReferenceListInput from './forms/ReferenceListInput'
import RichTextInput from './forms/RichTextInput'
import Carrot from './icons/Carrot'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Text } from './ui/text'
import { useToast } from './ui/use-toast'

export default function ResourceForm(props: {
  onSubmit: (resource: ResourceForDBWithImages) => Promise<
    | {
        success: true
        redirectTo: string
        message?: { title?: string; description?: string }
      }
    | { success: false; error: string }
  >
  initialValue?: ResourceInForm
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle',
  )
  const form = useFormWithSchema({
    schema: Schema.encodedBoundSchema(ResourceData),
    defaultValues:
      'initialValue' in props
        ? props.initialValue
        : {
            id: generateId(),
          },
    disabled: status !== 'idle',
  })
  const { setValue } = form
  const isDirty = form.formState.isDirty

  // Show alert when user tries to leave with unsaved changes
  // Does not work for Link navigation because of NextJS 🫠
  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Standard way to show the browser's "Leave Site?" dialog
      e.preventDefault()
      // Required for older browsers, some browsers show this message
      e.returnValue = 'Tem certeza que quer sair sem salvar as alterações?'
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

  const onSubmit: SubmitHandler<ResourceInForm> = useCallback(
    async (data) => {
      setStatus('submitting')
      const dataWithoutEmptyKeys = removeNullishKeys(data)
      const program = pipe(
        Schema.decode(ResourceWithUploadedImages)({
          ...dataWithoutEmptyKeys,
          thumbnail: Schema.is(ImageInForm)(dataWithoutEmptyKeys.thumbnail)
            ? dataWithoutEmptyKeys.thumbnail
            : undefined,
        }),
        // Before proceeding with the mutation, save the uploaded photos to the form in case we need to re-send it on errors
        Effect.tap((decoded) => {
          if (decoded.thumbnail) {
            setValue('thumbnail', decoded.thumbnail)
          }
        }),
        Effect.flatMap((decoded) =>
          Effect.tryPromise(() => props.onSubmit(decoded)),
        ),
        Effect.catchAll(() =>
          Effect.succeed({
            success: false,
            error: 'unknown-error',
          } as const),
        ),
      )
      const result = await Effect.runPromise(program)
      if (result.success) {
        toast({
          variant: 'default',
          title: result.message?.title || 'Material enviado com sucesso ✨',
          description:
            result.message?.description || 'Te enviando pra página dele...',
        })
        router.push(result.redirectTo)
        setStatus('success')
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao adicionar material',
          description: 'Por favor, tente novamente.',
        })
        setStatus('idle')
      }
    },
    [router, toast, setValue, props.onSubmit],
  )

  if (status === 'success') {
    return (
      <main
        className="flex h-full items-center justify-center"
        aria-live="polite"
      >
        <Card className="space-y-4 px-5 py-3">
          <CardHeader>
            <CardTitle>Recurso enviado com sucesso!</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="flex items-center justify-center gap-3">
              <Carrot className="h-6 w-6 animate-spin" /> Te levando pra página
              do recurso...
            </Text>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="px-pageX py-pageY relative">
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-[90rem] flex-wrap gap-4"
        >
          <div className="bg-background-card px-pageX fixed inset-x-0 bottom-0 z-20 w-full border-t py-4">
            <div className="m-auto flex max-w-[90rem] items-center justify-between gap-4">
              <Text as="h1" level="h3">
                {props.initialValue
                  ? `Sugerir edição para ${
                      props.initialValue.title || 'material'
                    }`
                  : 'Criar material'}
              </Text>
              <Button
                type="submit"
                disabled={form.formState.disabled}
                className="px-10"
              >
                <SendIcon className="w-[1.25em]" /> Enviar
              </Button>
            </div>
          </div>
          <div className="relative grid items-start gap-4 md:grid-cols-[1fr_350px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 md:sticky md:top-4 lg:col-span-2 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Visão geral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Field
                    form={form}
                    label={RESOURCE_FIELD_LABELS_MAP.title}
                    name="title"
                    render={({ field }) => (
                      <Input {...field} value={field.value || ''} type="text" />
                    )}
                  />
                  <Field
                    form={form}
                    label={RESOURCE_FIELD_LABELS_MAP.url}
                    name="url"
                    render={({ field }) => (
                      <Input {...field} value={field.value || ''} type="url" />
                    )}
                  />
                  <Field
                    form={form}
                    label={RESOURCE_FIELD_LABELS_MAP.credit_line}
                    name="credit_line"
                    render={({ field }) => (
                      <Input {...field} value={field.value || ''} type="text" />
                    )}
                  />
                  <Field
                    form={form}
                    name="description"
                    label={RESOURCE_FIELD_LABELS_MAP.description}
                    render={({ field }) => (
                      <RichTextInput
                        field={field}
                        placeholder="Sobre o que se trata esse material? Como ele soma na biblioteca agroecológica?"
                      />
                    )}
                  />
                  <Field
                    form={form}
                    name="thumbnail"
                    label={RESOURCE_FIELD_LABELS_MAP.thumbnail}
                    render={({ field }) => (
                      <ImageInput field={field} includeMetadata={false} />
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="grid auto-rows-max items-start gap-4 md:sticky md:top-4 lg:gap-8">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Propriedades</CardTitle>
                  <CardDescription>
                    Classificação do material na biblioteca
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Field
                    form={form}
                    name="tags"
                    label={RESOURCE_FIELD_LABELS_MAP.tags}
                    description="Se não encontrou a etiqueta que buscava, pode mandar um email pra gente em ola@gororobas.com, por favorzinho? 🤗"
                    render={({ field }) => (
                      <ReferenceListInput field={field} objectTypes={['Tag']} />
                    )}
                  />
                  <Field
                    form={form}
                    name="related_vegetables"
                    label={RESOURCE_FIELD_LABELS_MAP.related_vegetables}
                    description="Caso este material seja sobre um ou mais vegetais"
                    render={({ field }) => (
                      <ReferenceListInput
                        field={field}
                        objectTypes={['Vegetable']}
                      />
                    )}
                  />
                  <Field
                    form={form}
                    name="format"
                    label={RESOURCE_FIELD_LABELS_MAP.format}
                    render={({ field }) => (
                      <RadioGroupInput
                        field={field}
                        options={Object.entries(RESOURCE_FORMAT_TO_LABEL).map(
                          ([value, label]) => ({
                            value,
                            label,
                          }),
                        )}
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </FormProvider>
    </main>
  )
}
