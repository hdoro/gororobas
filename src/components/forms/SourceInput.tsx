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
        label={`Origem da ${label}`}
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
            label="Créditos"
            name={`${field.name}.credits`}
            render={({ field: creditsField }) => (
              <Input
                {...creditsField}
                value={creditsField.value || ''}
                type="text"
                placeholder={`Que pessoa ou organização produziu a ${label}?`}
              />
            )}
          />
          <Field
            form={form}
            label="Fonte"
            description="De preferência um link our URL"
            name={`${field.name}.origin`}
            render={({ field: originField }) => (
              <Input
                {...originField}
                value={originField.value || ''}
                type="text"
                placeholder={`Ex: https://site.br/pagina-da-${label}`}
              />
            )}
          />
        </>
      )}
      {type === 'GOROROBAS' && (
        <Field
          form={form}
          label="Pessoas"
          name={`${field.name}.userIds`}
          render={({ field: userIdsField }) => (
            <ReferenceListInput field={userIdsField} objectType="UserProfile" />
          )}
        />
      )}
    </div>
  )
}
