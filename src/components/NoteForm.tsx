'use client'

import {
  BOOLEAN_FIELD_CLASSNAMES,
} from '@/components/forms/BooleanInput'
import CheckboxesInput from '@/components/forms/CheckboxesInput'
import DateInput from '@/components/forms/DateInput'
import Field from '@/components/forms/Field'
import RichTextInput from '@/components/forms/RichTextInput'
import Carrot from '@/components/icons/Carrot'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { useToast } from '@/components/ui/use-toast'
import { NoteData, type NoteForDB, type NoteInForm } from '@/schemas'
import { generateId } from '@/utils/ids'
import { NOTE_PUBLISH_STATUS_TO_LABEL, NOTE_TYPE_TO_LABEL } from '@/utils/labels'
import { useFormWithSchema } from '@/utils/useFormWithSchema'
import { Effect, Schema, pipe } from 'effect'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import RadioGroupInput from './forms/RadioGroupInput'; 

export default function NoteForm(props: {
  onSubmit: (note: NoteForDB) => Promise<
    | {
        success: true
        redirectTo: string
        message?: { title?: string; description?: string }
      }
    | { success: false; error: string }
  >
  operation: 'create' | 'edit'
  initialValue?: NoteInForm
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle',
  )

  const form = useFormWithSchema({
    schema: Schema.encodedSchema(NoteData),
    defaultValues:
      'initialValue' in props
        ? props.initialValue
        : {
            id: generateId(),
            // public: true,
            publish_status: 'PUBLIC',
            published_at: new Date().toISOString(),
          },
    disabled: status === 'submitting',
  })

  const onSubmit: SubmitHandler<NoteInForm> = async (data) => {
    setStatus('submitting')

    const program = pipe(
      Schema.decode(NoteData)(data),
      Effect.flatMap((noteForDB) =>
        Effect.tryPromise(() => props.onSubmit(noteForDB)),
      ),
      Effect.catchAll(() =>
        Effect.succeed({
          success: false,
          error: 'unknown-error',
        } as const),
      ),
    )
    const response = await Effect.runPromise(program)
    if (response.success === true) {
      toast({
        variant: 'default',
        title: response.message?.title || 'Nota salva ✨',
        description:
          response.message?.description || 'Te enviando pra página dela...',
      })
      router.push(response.redirectTo)
      setStatus('success')
    } else {
      toast({
        variant: 'destructive',
        title:
          props.operation === 'create'
            ? 'Erro ao salvar a nota'
            : 'Erro ao atualizar a nota',
        description: 'Por favor, tente novamente.',
      })
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <main
        className="flex h-full items-center justify-center text-center"
        aria-live="polite"
      >
        <Card className="space-y-4 px-5 py-3">
          <CardHeader>
            <CardTitle>
              Nota {props.operation === 'create' ? 'criada' : 'atualizada'} com
              sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="flex items-center justify-center gap-3">
              <Carrot className="h-6 w-6 animate-spin" /> Te levando pra página
              da nota...
            </Text>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="h-full pt-6">
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          aria-disabled={form.formState.disabled}
          className="flex h-full flex-col gap-6 md:flex-row md:items-start md:px-pageX"
        >
          <div className="flex max-w-3xl flex-[5] flex-col gap-6 px-pageX md:rounded-lg md:border md:bg-card md:p-6 md:text-card-foreground md:shadow-sm">
            <Field
              form={form}
              name="title"
              hideLabel
              label="Título da nota"
              render={({ field }) => (
                <RichTextInput
                  field={field}
                  placeholder="O que experimentou, aprendeu ou descobriu hoje?"
                  type="noteTitle"
                  characterLimit={240}
                />
              )}
            />
            <Field
              form={form}
              name="types"
              hideLabel
              label="Tipo(s) da nota"
              render={({ field }) => (
                <CheckboxesInput
                  field={field}
                  options={Object.entries(NOTE_TYPE_TO_LABEL).map(
                    ([value, label]) => ({
                      value,
                      label,
                    }),
                  )}
                />
              )}
            />
            <Field
              form={form}
              name="body"
              hideLabel
              label="Corpo"
              // Hacky way of making the Prosemirror contenteditable span the remaining space to make it clickable
              classNames={{ root: 'flex-1' }}
              render={({ field }) => (
                <RichTextInput
                  field={field}
                  placeholder="Algo mais que gostaria de escrever sobre?"
                  type="noteBody"
                />
              )}
            />
          </div>

          <div className="fixed inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t border-t-primary-100 bg-background-card px-pageX py-4 md:relative md:flex-col-reverse md:items-start md:border-t-0 md:bg-transparent md:p-0">
            <div className="flex items-center gap-2 md:flex-col md:items-start">
              <Field
                form={form}
                name="public"
                label="Pública"
                classNames={BOOLEAN_FIELD_CLASSNAMES}
                render={({ field }) => (
                  <RadioGroupInput
                    field={field}
                    options={Object.entries(NOTE_PUBLISH_STATUS_TO_LABEL).map(
                      ([value, label]) => ({
                        value,
                        label,
                      }),
                    )}
                  />
                )}
              />
              <Field
                form={form}
                name="published_at"
                label="Enviada em"
                classNames={{
                  label: 'sr-only',
                  root: 'space-y-0 md:-ml-3',
                }}
                render={({ field }) => (
                  <DateInput field={field} timeWindow="past" />
                )}
              />
            </div>
            <Button
              type="submit"
              disabled={form.formState.disabled}
              className="md:h-11 md:px-9"
            >
              Enviar
            </Button>
          </div>
        </form>
      </FormProvider>
    </main>
  )
}
