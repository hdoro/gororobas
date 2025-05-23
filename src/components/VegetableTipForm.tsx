'use client'

import { m } from '@/paraglide/messages'
import {
  VegetableTipData,
  type VegetableTipForDB,
  type VegetableTipInForm,
} from '@/schemas'
import { removeNullishKeys } from '@/utils/diffs'
import { TIP_SUBJECT_TO_LABEL } from '@/utils/labels'
import { useFormWithSchema } from '@/utils/useFormWithSchema'
import { Effect, Schema, pipe } from 'effect'
import { useRouter } from 'next/navigation'
import { type JSX, useCallback, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import ArrayInput from './forms/ArrayInput'
import CheckboxesInput from './forms/CheckboxesInput'
import Field, { ArrayField } from './forms/Field'
import RichTextInput from './forms/RichTextInput'
import SourceInput from './forms/SourceInput'
import { Button } from './ui/button'
import { DialogBody, DialogClose, DialogFooter } from './ui/dialog'
import { useToast } from './ui/use-toast'

export default function VegetableTipForm(props: {
  onSubmit: (tip: VegetableTipForDB) => Promise<
    | {
        success: true
        message?: { title?: string; description?: string }
      }
    | { success: false; error: string }
  >
  succesState: JSX.Element
  initialValue?: Partial<VegetableTipInForm>
  operation: 'create' | 'edit'
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle',
  )
  const form = useFormWithSchema({
    schema: Schema.encodedBoundSchema(VegetableTipData),
    defaultValues:
      'initialValue' in props ? (props.initialValue as VegetableTipInForm) : {},
    disabled: status !== 'idle',
  })

  const onSubmit: SubmitHandler<VegetableTipInForm> = useCallback(
    async (data) => {
      setStatus('submitting')
      const dataWithoutEmptyKeys = removeNullishKeys(data)
      const program = pipe(
        Schema.decode(VegetableTipData)(dataWithoutEmptyKeys),
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
        // refresh to keep data fresh while the user hasn't yet closed the dialog
        router.refresh()

        setStatus('success')
      } else {
        toast({
          variant: 'destructive',
          title: m.jumpy_honest_manatee_adore({ operation: props.operation }),
          description: m.polite_gray_otter_delight(),
        })
        setStatus('idle')
      }
    },
    [router, toast, props.onSubmit, props.operation],
  )

  if (status === 'success') {
    return <>{props.succesState}</>
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogBody className="space-y-6">
          <Field
            form={form}
            name={'content'}
            label={m.candid_slimy_toucan_chop()}
            render={({ field }) => (
              <RichTextInput
                field={field}
                placeholder={m.vivid_north_chicken_cherish()}
              />
            )}
          />
          <Field
            form={form}
            name={'subjects'}
            label={m.sound_still_earthworm_grasp()}
            render={({ field }) => (
              <CheckboxesInput
                field={field}
                options={Object.entries(TIP_SUBJECT_TO_LABEL).map(
                  ([value, label]) => ({
                    value,
                    label,
                  }),
                )}
              />
            )}
          />
          <ArrayField
            form={form}
            label={m.flat_antsy_horse_ripple()}
            name={'sources'}
            render={({ field: sourcesField }) => (
              <ArrayInput
                field={sourcesField}
                newItemLabel={m.arable_least_guppy_grip()}
                renderItem={(index) => (
                  <Field
                    form={form}
                    name={`${sourcesField.name}.${index}`}
                    label={m.glad_vexed_toad_mop({ number: index + 1 })}
                    hideLabel
                    render={({ field: subField }) => (
                      <SourceInput
                        field={subField}
                        label={m.ideal_fit_dove_agree()}
                      />
                    )}
                  />
                )}
              />
            )}
          />
        </DialogBody>
        <DialogFooter>
          <Button type="submit" disabled={form.formState.disabled} size="lg">
            {props.operation === 'edit'
              ? m.low_next_sloth_honor()
              : m.formal_lower_parrot_treat()}
          </Button>
          {status === 'idle' && (
            <DialogClose asChild>
              <Button mode="bleed" tone="neutral" size="lg">
                {m.solid_low_cobra_explore()}
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </form>
    </FormProvider>
  )
}
