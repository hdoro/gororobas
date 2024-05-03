import { cn } from '@/utils/cn'
import type { DeepKeys, FieldApi } from '@tanstack/react-form'
import type { PropsWithChildren } from 'react'
import { Label } from '../ui/label'
import { getFieldId, getFieldLabelId } from './form.utils'

export default function FormField<
  FormValue extends Record<string, any>,
  FieldName extends DeepKeys<FormValue>,
>({
  field,
  children,
  label,
}: PropsWithChildren<{
  field: FieldApi<FormValue, FieldName>
  label: string
}>) {
  const hasErrors = field.state.meta.errors.length > 0
  return (
    <div className="block space-y-2">
      <Label
        className={cn(hasErrors && 'text-red-700')}
        htmlFor={getFieldId(field)}
        id={getFieldLabelId(field.name)}
      >
        {label}
      </Label>
      {children}
      {hasErrors ? (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-2 font-normal text-red-700 text-xs"
        >
          {field.state.meta.errors.join(', ')}
        </div>
      ) : null}
    </div>
  )
}
