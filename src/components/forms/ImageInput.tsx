'use client'

import type { ImageInForm } from '@/schemas'
import { generateId } from '@/utils/ids'
import { CircleXIcon } from 'lucide-react'
import {
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  useFormContext,
  useWatch,
} from 'react-hook-form'
import { SanityImage } from '../SanityImage'
import { Button } from '../ui/button'
import { FormControl } from '../ui/form'
import { Input } from '../ui/input'
import ArrayInput from './ArrayInput'
import Field, { ArrayField } from './Field'
import ImageDropzone from './ImageDropzone'
import SourceInput from './SourceInput'

/**
 * Includes the image field itself and its metadata fields (optional) - sources and label.
 */
export default function ImageInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field: rootField,
  includeMetadata = true,
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  includeMetadata?: boolean
}) {
  const form = useFormContext()

  if (!includeMetadata) {
    return <ImageField field={rootField} />
  }

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex-[0_0_12.5rem]">
        <ImageField field={rootField} />
      </div>
      <div className="flex-1 space-y-4">
        <Field
          form={form}
          label="Rótulo"
          name={`${rootField.name}.label`}
          render={({ field: labelField }) => (
            <Input
              {...labelField}
              value={labelField.value || ''}
              type="text"
              placeholder="Sobre o que é a imagem?"
            />
          )}
        />
        <ArrayField
          form={form}
          label="Fontes"
          name={`${rootField.name}.sources`}
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
                    <SourceInput field={subField} label="imagem" />
                  )}
                />
              )}
            />
          )}
        />
      </div>
    </div>
  )
}

function ImageField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ field: rootField }: { field: ControllerRenderProps<TFieldValues, TName> }) {
  const form = useFormContext()
  const imageData = useWatch({
    control: form.control,
    name: rootField.name,
  }) as typeof ImageInForm.Encoded | null | undefined

  function clearValue() {
    rootField.onChange({
      label: imageData?.label,
      sources: imageData?.sources,
      // As we're changing images, we need to generate a new ID for EdgeDB
      id: generateId(),
    })
  }

  if (imageData && 'sanity_id' in imageData && imageData.sanity_id) {
    return (
      <Field
        form={form}
        label="Imagem"
        hideLabel
        name={rootField.name}
        render={({ field }) => (
          <div className="relative flex aspect-square w-[12.5rem] flex-[0_0_max-content] items-center justify-center rounded-lg border-2 border-border bg-card">
            {!field.disabled && (
              <FormControl>
                <Button
                  onClick={clearValue}
                  className="absolute right-2 top-2 rounded-full"
                  aria-label="Remover imagem"
                  tone="destructive"
                  mode="outline"
                  size="icon"
                  disabled={field.disabled}
                >
                  <CircleXIcon className="stroke-current" />
                </Button>
              </FormControl>
            )}
            <SanityImage image={imageData} maxWidth={200} />
          </div>
        )}
      />
    )
  }

  return (
    <Field
      form={form}
      label="Imagem"
      hideLabel
      name={`${rootField.name}.file`}
      render={({ field: fileField }) => (
        <ImageDropzone
          field={fileField}
          /** For some arcane reason with react-hook-form, this `fileField.value` is stale.
           * Passing the fresh `imageData` solves the issue. */
          value={imageData && 'file' in imageData ? imageData.file : null}
          clearValue={clearValue}
        />
      )}
    />
  )
}
