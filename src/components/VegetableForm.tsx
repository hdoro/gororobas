'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  VegetableData,
  type VegetableForDBWithImages,
  type VegetableInForm,
  VegetableWithUploadedImages,
} from '@/schemas'
import type { VegetableLifeCycle, VegetableUsage } from '@/types'
import { removeNullishKeys } from '@/utils/diffs'
import { generateId } from '@/utils/ids'
import {
  EDIBLE_PART_TO_LABEL,
  GENDER_TO_LABEL,
  PLANTING_METHOD_TO_LABEL,
  STRATUM_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_FIELD_LABELS_MAP,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { gender } from '@/utils/strings'
import { useFormWithSchema } from '@/utils/useFormWithSchema'
import { Effect, Schema, pipe } from 'effect'
import { SendIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import {
  FormProvider,
  type SubmitHandler,
  useFormContext,
} from 'react-hook-form'
import ArrayInput from './forms/ArrayInput'
import CheckboxesInput from './forms/CheckboxesInput'
import Field, { ArrayField } from './forms/Field'
import HandleInput from './forms/HandleInput'
import ImageInput from './forms/ImageInput'
import NumberInput from './forms/NumberInput'
import RadioGroupInput from './forms/RadioGroupInput'
import ReferenceListInput from './forms/ReferenceListInput'
import RichTextInput from './forms/RichTextInput'
import SourceInput from './forms/SourceInput'
import VegetableVarietyInput from './forms/VegetableVarietyInput'
import Carrot from './icons/Carrot'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Text } from './ui/text'
import { useToast } from './ui/use-toast'

export default function VegetableForm(props: {
  onSubmit: (vegetable: VegetableForDBWithImages) => Promise<
    | {
        success: true
        redirectTo: string
        message?: { title?: string; description?: string }
      }
    | { success: false; error: string }
  >
  initialValue?: VegetableInForm
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle',
  )
  const form = useFormWithSchema({
    schema: Schema.encodedBoundSchema(VegetableData),
    defaultValues:
      'initialValue' in props
        ? props.initialValue
        : {
            id: generateId(),
            handle: '',
          },
    disabled: status !== 'idle',
  })
  const { setValue } = form

  const onSubmit: SubmitHandler<VegetableInForm> = useCallback(
    async (data) => {
      setStatus('submitting')
      const dataWithoutEmptyKeys = removeNullishKeys(data)
      const program = pipe(
        Schema.decode(VegetableWithUploadedImages)(dataWithoutEmptyKeys),
        // Before proceeding with the mutation, save the uploaded photos to the form in case we need to re-send it on errors
        Effect.tap((decoded) => {
          if (decoded.photos) {
            setValue('photos', decoded.photos)
          }

          if (decoded.varieties) {
            decoded.varieties.forEach((variety, index) => {
              if (variety.photos) {
                setValue(`varieties.${index}.photos`, variety.photos)
              }
            })
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
          title: result.message?.title || 'Vegetal criado com sucesso ✨',
          description:
            result.message?.description || 'Te enviando pra página dele...',
        })
        router.push(result.redirectTo)
        setStatus('success')
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao adicionar vegetal',
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
            <CardTitle>Vegetal criado com sucesso!</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="flex items-center justify-center gap-3">
              <Carrot className="h-6 w-6 animate-spin" /> Te levando pra página
              do vegetal...
            </Text>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="relative px-pageX py-pageY">
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-[90rem] flex-wrap gap-4"
        >
          <div className="fixed inset-x-0 bottom-0 z-20 w-full border-t bg-background-card px-pageX py-4">
            <div className="m-auto flex max-w-[90rem] items-center justify-between gap-4">
              <Text as="h1" level="h3">
                {props.initialValue
                  ? `Sugerir edição para ${gender.article(props.initialValue.gender || 'NEUTRO')} ${
                      props.initialValue.names?.[0]?.value || 'vegetal'
                    }`
                  : 'Criar vegetal'}
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
                  <ArrayField
                    label={VEGETABLE_FIELD_LABELS_MAP.names}
                    name="names"
                    form={form}
                    render={({ field }) => (
                      <ArrayInput
                        field={field}
                        newItemValue={{ value: '' }}
                        newItemLabel="Novo nome"
                        renderItem={(index) => (
                          <Field
                            form={form}
                            name={`${field.name}.${index}.value`}
                            label={`Nome ${index + 1}`}
                            hideLabel
                            render={({ field: subField }) => (
                              <Input {...subField} />
                            )}
                          />
                        )}
                      />
                    )}
                  />
                  <Field
                    form={form}
                    label={VEGETABLE_FIELD_LABELS_MAP.handle}
                    name="handle"
                    render={({ field }) => (
                      <HandleInput field={field} path="vegetais" />
                    )}
                  />
                  <ArrayField
                    name="scientific_names"
                    label={VEGETABLE_FIELD_LABELS_MAP.scientific_names}
                    form={form}
                    render={({ field }) => (
                      <ArrayInput
                        field={field}
                        newItemValue={{ value: '' }}
                        newItemLabel="Novo nome científico"
                        renderItem={(index) => (
                          <Field
                            form={form}
                            name={`${field.name}.${index}.value`}
                            label={`Nome científico ${index + 1}`}
                            hideLabel
                            render={({ field: subField }) => (
                              <Input {...subField} />
                            )}
                          />
                        )}
                      />
                    )}
                  />
                  <Field
                    form={form}
                    name="origin"
                    label={VEGETABLE_FIELD_LABELS_MAP.origin}
                    render={({ field }) => (
                      <Input {...field} value={field.value || ''} type="text" />
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      form={form}
                      name="height_min"
                      label={VEGETABLE_FIELD_LABELS_MAP.height_min}
                      render={({ field }) => (
                        <NumberInput field={field} format="centimeters" />
                      )}
                    />
                    <Field
                      form={form}
                      name="height_max"
                      label={VEGETABLE_FIELD_LABELS_MAP.height_max}
                      render={({ field }) => (
                        <NumberInput field={field} format="centimeters" />
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      form={form}
                      name="temperature_min"
                      label={VEGETABLE_FIELD_LABELS_MAP.temperature_min}
                      render={({ field }) => (
                        <NumberInput field={field} format="temperature" />
                      )}
                    />
                    <Field
                      form={form}
                      name="temperature_max"
                      label={VEGETABLE_FIELD_LABELS_MAP.temperature_max}
                      render={({ field }) => (
                        <NumberInput field={field} format="temperature" />
                      )}
                    />
                  </div>
                  <DevelopmentCycleFields />
                  <Field
                    form={form}
                    name="friends"
                    label={VEGETABLE_FIELD_LABELS_MAP.friends}
                    description="Plantas que gostam de serem plantadas e estarem próximas. Simbioses e consórcios também entram :)"
                    render={({ field }) => (
                      <ReferenceListInput
                        field={field}
                        objectTypes={['Vegetable']}
                      />
                    )}
                  />
                  <Field
                    form={form}
                    name="content"
                    label={VEGETABLE_FIELD_LABELS_MAP.content}
                    render={({ field }) => (
                      <RichTextInput
                        field={field}
                        placeholder="Alguma curiosidade, história, ritual, ou dica solta que gostaria de compartilhar?"
                      />
                    )}
                  />
                  <ArrayField
                    form={form}
                    name={'sources'}
                    label={VEGETABLE_FIELD_LABELS_MAP.sources}
                    render={({ field: sourcesField }) => (
                      <ArrayInput
                        field={sourcesField}
                        newItemLabel="Nova fonte"
                        renderItem={(index) => (
                          <Field
                            form={form}
                            name={`${sourcesField.name}.${index}`}
                            label={`Fonte #${index + 1}`}
                            hideLabel
                            render={({ field: subField }) => (
                              <SourceInput
                                field={subField}
                                label="informação"
                              />
                            )}
                          />
                        )}
                      />
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{VEGETABLE_FIELD_LABELS_MAP.photos}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ArrayField
                    form={form}
                    name="photos"
                    label={VEGETABLE_FIELD_LABELS_MAP.photos}
                    hideLabel
                    render={({ field }) => {
                      return (
                        <ArrayInput
                          field={field}
                          newItemLabel="Nova foto"
                          renderItem={(index) => (
                            <Field
                              form={form}
                              name={`${field.name}.${index}`}
                              label={`Foto #${index + 1}`}
                              hideLabel
                              render={({ field: subField }) => (
                                <ImageInput field={subField} />
                              )}
                            />
                          )}
                        />
                      )
                    }}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{VEGETABLE_FIELD_LABELS_MAP.varieties}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ArrayField
                    form={form}
                    name="varieties"
                    label={VEGETABLE_FIELD_LABELS_MAP.varieties}
                    hideLabel
                    render={({ field }) => {
                      return (
                        <ArrayInput
                          field={field}
                          newItemValue={{
                            names: [{ value: '' }],
                          }}
                          newItemLabel="Nova variedade"
                          inputType="dialog"
                          renderItem={(index) => (
                            <Field
                              form={form}
                              name={`${field.name}.${index}`}
                              label={`Variedade #${index + 1}`}
                              hideLabel
                              render={({ field: subField }) => (
                                <VegetableVarietyInput
                                  index={index}
                                  field={subField}
                                />
                              )}
                            />
                          )}
                        />
                      )
                    }}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="grid auto-rows-max items-start gap-4 md:sticky md:top-4 lg:gap-8">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Propriedades</CardTitle>
                  <CardDescription>
                    Informações básicas sobre o uso e características do
                    vegetal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Field
                    form={form}
                    name="gender"
                    label={VEGETABLE_FIELD_LABELS_MAP.gender}
                    render={({ field }) => (
                      <RadioGroupInput
                        field={field}
                        options={Object.entries(GENDER_TO_LABEL).map(
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
                    name="uses"
                    label={VEGETABLE_FIELD_LABELS_MAP.uses}
                    render={({ field }) => (
                      <CheckboxesInput
                        field={field}
                        options={Object.entries(USAGE_TO_LABEL).map(
                          ([value, label]) => ({
                            value,
                            label,
                          }),
                        )}
                      />
                    )}
                  />
                  <EdibleParts />
                  <Field
                    form={form}
                    name="lifecycles"
                    label={VEGETABLE_FIELD_LABELS_MAP.lifecycles}
                    render={({ field }) => (
                      <CheckboxesInput
                        field={field}
                        options={Object.entries(
                          VEGETABLE_LIFECYCLE_TO_LABEL,
                        ).map(([value, label]) => ({ value, label }))}
                      />
                    )}
                  />
                  <Field
                    form={form}
                    name="strata"
                    label={VEGETABLE_FIELD_LABELS_MAP.strata}
                    render={({ field }) => (
                      <CheckboxesInput
                        field={field}
                        options={Object.entries(STRATUM_TO_LABEL).map(
                          ([value, label]) => ({ value, label }),
                        )}
                      />
                    )}
                  />
                  <Field
                    form={form}
                    name="planting_methods"
                    label={VEGETABLE_FIELD_LABELS_MAP.planting_methods}
                    render={({ field }) => (
                      <CheckboxesInput
                        field={field}
                        options={Object.entries(PLANTING_METHOD_TO_LABEL).map(
                          ([value, label]) => ({ value, label }),
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

/** Only show the development cycle fields if the planting method is not perennial */
function DevelopmentCycleFields() {
  const form = useFormContext()
  const lifecycles = (form.watch('lifecycles') || []) as VegetableLifeCycle[]

  if (lifecycles.includes('PERENE')) return null

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field
        form={form}
        name="development_cycle_min"
        label={VEGETABLE_FIELD_LABELS_MAP.development_cycle_min}
        render={({ field }) => <NumberInput field={field} format="days" />}
      />
      <Field
        form={form}
        name="development_cycle_max"
        label={VEGETABLE_FIELD_LABELS_MAP.development_cycle_max}
        render={({ field }) => <NumberInput field={field} format="days" />}
      />
    </div>
  )
}

function EdibleParts() {
  const form = useFormContext()
  const uses = (form.watch('uses') || []) as VegetableUsage[]

  if (!uses.includes('ALIMENTO_HUMANO')) return null

  return (
    <Field
      form={form}
      name="edible_parts"
      label={VEGETABLE_FIELD_LABELS_MAP.edible_parts}
      render={({ field }) => (
        <CheckboxesInput
          field={field}
          options={Object.entries(EDIBLE_PART_TO_LABEL).map(
            ([value, label]) => ({ value, label }),
          )}
        />
      )}
    />
  )
}
