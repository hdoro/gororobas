import type { SourceType } from '@/types'
import { SOURCE_TYPE_TO_LABEL } from '@/utils/labels'
import {
  useFormContext,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { Input } from '../ui/input'
import Field from './Field'
import ImageDropzone from './ImageDropzone'
import RadioGroupInput from './RadioGroupInput'

export default function ImageInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ field }: { field: ControllerRenderProps<TFieldValues, TName> }) {
  const form = useFormContext()

  const sourceType = form.watch(`${field.name}.sourceType`) as SourceType
  return (
    <div className="flex gap-6 items-start">
      <Field
        form={form}
        label="Imagem"
        hideLabel
        name={`${field.name}.data.file`}
        render={({ field }) => <ImageDropzone field={field} />}
      />
      <div className="space-y-4 flex-1">
        <Field
          form={form}
          label="Rótulo"
          name={`${field.name}.label`}
          render={({ field: labelField }) => (
            <Input
              {...labelField}
              value={labelField.value || ''}
              type="text"
              placeholder="Sobre o que é a imagem?"
            />
          )}
        />
        <Field
          form={form}
          label="Origem da imagem"
          name={`${field.name}.sourceType`}
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
        {/* @TODO: Gororobas source (needs access to EdgeDB users) */}
        {sourceType === 'EXTERNAL' && (
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
                  placeholder="Que pessoa ou organização produziu a imagem?"
                />
              )}
            />
            <Field
              form={form}
              label="Fonte"
              description="De preferência um link our URL"
              name={`${field.name}.source`}
              render={({ field: sourceField }) => (
                <Input
                  {...sourceField}
                  value={sourceField.value || ''}
                  type="text"
                  placeholder="Ex: https://site.br/pagina-da-imagem"
                />
              )}
            />
          </>
        )}
      </div>
    </div>
  )
}
