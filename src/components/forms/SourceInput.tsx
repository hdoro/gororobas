import { m } from '@/paraglide/messages'
import type { SourceType } from '@/types'
import { SOURCE_TYPE_TO_LABEL } from '@/utils/labels'
import {
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form'
import { Input } from '../ui/input'
import Field from './Field'
import RadioGroupInput from './RadioGroupInput'
import ReferenceListInput from './ReferenceListInput'

export default function SourceInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  label,
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  label: string
}) {
  const form = useFormContext()

  const type = form.watch(`${field.name}.type`) as SourceType
  return (
    <div className="space-y-4">
      <Field
        form={form}
        label={m.new_shy_gibbon_edit({ label })}
        name={`${field.name}.type`}
        render={({ field: sourceTypeField }) => (
          <RadioGroupInput
            field={sourceTypeField}
            options={[
              {
                label: SOURCE_TYPE_TO_LABEL.EXTERNAL,
                value: 'EXTERNAL' satisfies SourceType,
              },
              {
                label: SOURCE_TYPE_TO_LABEL.GOROROBAS,
                value: 'GOROROBAS' satisfies SourceType,
              },
            ]}
          />
        )}
      />
      {type === 'EXTERNAL' && (
        <>
          <Field
            form={form}
            label={m.awake_least_javelina_forgive()}
            name={`${field.name}.credits`}
            render={({ field: creditsField }) => (
              <Input
                {...creditsField}
                value={creditsField.value || ''}
                type="text"
                placeholder={m.bright_small_niklas_approve({ label })}
              />
            )}
          />
          <Field
            form={form}
            label={m.small_jolly_lemur_yell()}
            description={m.brief_jolly_buzzard_grasp()}
            name={`${field.name}.origin`}
            render={({ field: originField }) => (
              <Input
                {...originField}
                value={originField.value || ''}
                type="text"
                placeholder={m.dirty_silly_rook_rush({ label })}
              />
            )}
          />
        </>
      )}
      {type === 'GOROROBAS' && (
        <Field
          form={form}
          label={m.spare_dizzy_earthworm_trust()}
          name={`${field.name}.userIds`}
          render={({ field: userIdsField }) => (
            <ReferenceListInput
              field={userIdsField}
              objectTypes={['UserProfile']}
            />
          )}
        />
      )}
    </div>
  )
}
