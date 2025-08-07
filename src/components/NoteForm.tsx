'use client'

import CheckboxesInput from '@/components/forms/CheckboxesInput'
import DateInput from '@/components/forms/DateInput'
import Field from '@/components/forms/Field'
import RichTextInput from '@/components/forms/RichTextInput'
import Carrot from '@/components/icons/Carrot'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { useToast } from '@/components/ui/use-toast'
import type { NotePublishStatus } from '@/gel.interfaces'
import { useFixedBottomPosition } from '@/hooks/useFixedBottomPosition'
import { m } from '@/paraglide/messages'
import { NoteData, type NoteForDB, type NoteInForm } from '@/schemas'
import { cn } from '@/utils/cn'
import { generateId } from '@/utils/ids'
import {
  NOTE_PUBLISH_STATUS_TO_LABEL,
  NOTE_TYPE_TO_LABEL,
} from '@/utils/labels'
import { useFormWithSchema } from '@/utils/useFormWithSchema'
import { Effect, Schema, pipe } from 'effect'
import { CarrotIcon, GlobeIcon, LockIcon, type LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type PropsWithChildren, useState } from 'react'
import { FormProvider, type SubmitHandler } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'

type PublishStatusExplainer = {
  label: string
  description: string
  icon: LucideIcon
}

export const PUBLISH_STATUS_EXPLAINERS = {
  get PRIVATE() {
    return {
      label: m.close_plain_pigeon_favor(),
      description: m.red_giant_florian_hurl(),
      icon: LockIcon,
    }
  },
  get COMMUNITY() {
    return {
      label: m.house_long_llama_savor(),
      description: m.north_house_sloth_hike(),
      icon: CarrotIcon,
    }
  },
  get PUBLIC() {
    return {
      label: m.close_whole_monkey_chop(),
      description: m.ornate_stout_jan_assure(),
      icon: GlobeIcon,
    }
  },
} as const satisfies Record<NotePublishStatus, PublishStatusExplainer>

function ActionBar(props: PropsWithChildren) {
  const position = useFixedBottomPosition(0)

  return (
    <div
      className={cn(
        position.className,
        'border-t-primary-100 bg-background-card flex items-center justify-between gap-2 border-t px-2 py-4',
        'md:relative md:flex-1 md:flex-col-reverse md:items-start md:gap-4 md:border-t-0 md:bg-transparent md:p-0',
      )}
      style={position.styles}
    >
      {props.children}
    </div>
  )
}

function VisibilityOption({
  icon: Icon,
  label,
  description,
  placement,
}: PublishStatusExplainer & { placement: 'trigger' | 'popover' }) {
  return (
    <div className="flex items-center gap-2 text-left @max-[150px]:flex-col @max-[150px]:items-start">
      <Icon className="text-primary-800 size-[1.25em] flex-[0_0_1.25em]" />
      <div className="-space-y-0.5">
        <Text weight="semibold" level="sm">
          {label}
        </Text>
        <Text
          level="sm"
          className={placement === 'trigger' ? 'max-md:sr-only' : ''}
        >
          {description}
        </Text>
      </div>
    </div>
  )
}

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
            publish_status: 'COMMUNITY',
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
        title: response.message?.title || m.legal_tough_jackal_clip(),
        description:
          response.message?.description || m.that_cuddly_cowfish_cook(),
      })
      router.push(response.redirectTo)
      setStatus('success')
    } else {
      toast({
        variant: 'destructive',
        title: m.just_teal_okapi_gasp({ operation: props.operation }),
        description: m.dull_brief_turtle_reap(),
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
              {m.glad_quaint_manatee_hint({ operation: props.operation })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="flex items-center justify-center gap-3">
              <Carrot className="h-6 w-6 animate-spin" />{' '}
              {m.sunny_noisy_walrus_view()}
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
          className="md:px-pageX flex h-full flex-col gap-6 md:flex-row md:items-start"
        >
          <div className="px-pageX md:bg-card md:text-card-foreground flex max-w-3xl flex-5 flex-col gap-6 pb-24 md:rounded-lg md:border md:p-6 md:pb-6 md:shadow-xs">
            <Field
              form={form}
              name="title"
              hideLabel
              label={m.house_busy_grebe_view()}
              render={({ field }) => (
                <RichTextInput
                  field={field}
                  placeholder={m.gray_late_shark_scoop()}
                  type="noteTitle"
                  characterLimit={240}
                />
              )}
            />
            <Field
              form={form}
              name="types"
              hideLabel
              label={m.loved_patient_antelope_tap()}
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
              label={m.flaky_alert_mongoose_learn()}
              // Hacky way of making the Prosemirror contenteditable span the remaining space to make it clickable
              classNames={{ root: 'flex-1' }}
              render={({ field }) => (
                <RichTextInput
                  field={field}
                  placeholder={m.mellow_jolly_capybara_imagine()}
                  type="noteBody"
                />
              )}
            />
          </div>

          <ActionBar>
            <div className="flex flex-wrap items-center gap-2 md:w-full md:max-w-2xs md:flex-col md:items-stretch md:gap-4">
              <Field
                form={form}
                name="published_at"
                label={m.fair_key_pigeon_mop()}
                classNames={{
                  label: 'max-md:sr-only md:ml-3 md:mb-1',
                  root: 'md:-ml-3',
                }}
                render={({ field }) => (
                  <DateInput field={field} timeWindow="past" />
                )}
              />
              <Field
                form={form}
                name="publish_status"
                label={m.spicy_zesty_camel_catch()}
                classNames={{
                  label: 'max-md:sr-only',
                  root: 'space-y-0',
                }}
                render={({ field }) => {
                  const fieldValue = field.value || 'PUBLIC'
                  const valueExplainers = PUBLISH_STATUS_EXPLAINERS[fieldValue]
                  return (
                    <Select
                      value={fieldValue}
                      onValueChange={(newValue) => field.onChange(newValue)}
                      disabled={form.formState.disabled}
                    >
                      <SelectTrigger className="h-auto gap-2 px-2 md:@container md:mt-2 md:px-4">
                        <VisibilityOption
                          {...valueExplainers}
                          placement="trigger"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-base font-normal">
                            {m.spicy_zesty_camel_catch()}
                          </SelectLabel>
                          {Object.keys(NOTE_PUBLISH_STATUS_TO_LABEL).map(
                            (optionValue) => {
                              const optionExplainers =
                                PUBLISH_STATUS_EXPLAINERS[
                                  optionValue as NotePublishStatus
                                ]
                              return (
                                <SelectItem
                                  key={optionValue}
                                  value={optionValue}
                                >
                                  <VisibilityOption
                                    {...optionExplainers}
                                    placement="popover"
                                  />
                                </SelectItem>
                              )
                            },
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )
                }}
              />
            </div>
            <Button
              type="submit"
              disabled={form.formState.disabled}
              className="flex-[0_0_max-content] md:h-11 md:px-9"
            >
              {m.candid_loose_liger_inspire()}
            </Button>
          </ActionBar>
        </form>
      </FormProvider>
    </main>
  )
}
