'use client'

import { Effect, pipe, Schema } from 'effect'
import { SendIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
  FormProvider,
  type SubmitHandler,
  useFormContext,
} from 'react-hook-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { m } from '@/paraglide/messages'
import {
  VegetableData,
  type VegetableForDBWithImages,
  type VegetableInForm,
  VegetableWithUploadedImages,
} from '@/schemas'
import type { VegetableUsage } from '@/types'
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
import { useFormWithSchema } from '@/utils/useFormWithSchema'
import ArrayInput from './forms/ArrayInput'
import CheckboxesInput from './forms/CheckboxesInput'
import Field, { ArrayField } from './forms/Field'
import HandleInput from './forms/HandleInput'
import ImageInput from './forms/ImageInput'
import NumberInput from './forms/NumberInput'
import RadioGroupInput from './forms/RadioGroupInput'
import ReferenceListInput from './forms/ReferenceListInput'
import RichTextInput from './forms/RichTextInput'
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
        message?: { title: string; description?: string }
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
  const isDirty = form.formState.isDirty

  // Show alert when user tries to leave with unsaved changes
  // Does not work for Link navigation because of NextJS 🫠
  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Standard way to show the browser's "Leave Site?" dialog
      e.preventDefault()
      // Required for older browsers, some browsers show this message
      e.returnValue = m.jumpy_ok_sheep_comfort()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

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
        router.push(result.redirectTo)
        setStatus('success')
      } else {
        toast({
          variant: 'destructive',
          title: m.elegant_that_pigeon_compose(),
          description: m.polite_zippy_finch_surge(),
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
            <CardTitle>{m.patient_key_stork_nudge()}</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="flex items-center justify-center gap-3">
              <Carrot className="h-6 w-6 animate-spin" />{' '}
              {m.jolly_only_hamster_devour()}
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
                  ? m.aloof_gross_gopher_push({
                      gender: props.initialValue.gender || 'NEUTRO',
                      name: props.initialValue.names?.[0]?.value || 'vegetal',
                    })
                  : m.frail_only_fly_savor()}
              </Text>
              <Button
                type="submit"
                disabled={form.formState.disabled}
                className="px-10"
              >
                <SendIcon className="w-[1.25em]" />{' '}
                {m.gaudy_tasty_crow_promise()}
              </Button>
            </div>
          </div>
          <div className="relative grid items-start gap-4 md:grid-cols-[1fr_350px] lg:grid-cols-3 lg:gap-8">
            <div className="grid auto-rows-max items-start gap-4 md:sticky md:top-4 lg:col-span-2 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>{m.loose_soft_shark_embrace()}</CardTitle>
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
                        newItemLabel={m.ideal_sharp_moose_kick()}
                        renderItem={(index) => (
                          <Field
                            form={form}
                            name={`${field.name}.${index}.value`}
                            label={m.that_super_fireant_animate({
                              number: index + 1,
                            })}
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
                        newItemLabel={m.weary_late_raven_lift()}
                        renderItem={(index) => (
                          <Field
                            form={form}
                            name={`${field.name}.${index}.value`}
                            label={m.zany_trite_badger_prosper({
                              number: index + 1,
                            })}
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

                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      form={form}
                      name="development_cycle_min"
                      label={VEGETABLE_FIELD_LABELS_MAP.development_cycle_min}
                      description={m.top_clear_samuel_pout()}
                      render={({ field }) => (
                        <NumberInput field={field} format="days" />
                      )}
                    />
                    <Field
                      form={form}
                      name="development_cycle_max"
                      label={VEGETABLE_FIELD_LABELS_MAP.development_cycle_max}
                      render={({ field }) => (
                        <NumberInput field={field} format="days" />
                      )}
                    />
                  </div>
                  <Field
                    form={form}
                    name="friends"
                    label={VEGETABLE_FIELD_LABELS_MAP.friends}
                    description={m.maroon_main_fox_honor()}
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
                        placeholder={m.agent_gross_tortoise_snap()}
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
                          newItemLabel={m.aloof_busy_bulldog_wave()}
                          renderItem={(index) => (
                            <Field
                              form={form}
                              name={`${field.name}.${index}`}
                              label={m.quick_active_termite_dazzle({
                                number: index + 1,
                              })}
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
                          newItemLabel={m.new_big_cuckoo_lend()}
                          inputType="dialog"
                          renderItem={(index) => (
                            <Field
                              form={form}
                              name={`${field.name}.${index}`}
                              label={m.gray_neat_jurgen_yell({
                                number: index + 1,
                              })}
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
                  <CardTitle>{m.known_short_mare_accept()}</CardTitle>
                  <CardDescription>
                    {m.crisp_pretty_quail_buy()}
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
