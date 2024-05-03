import type { DeepKeys, FieldApi } from '@tanstack/react-form'
import { Input } from '../ui/input'
import { getFieldProps } from './form.utils'

export default function TextInput<
  FormValue extends Record<string, any>,
  FieldName extends DeepKeys<FormValue>,
>({ field }: { field: FieldApi<FormValue, FieldName> }) {
  const value = (field.state.value || '') as typeof field.state.value
  return (
    <div className="relative">
      <Input
        {...getFieldProps(field)}
        value={value as string}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange(e.target.value as typeof field.state.value)
        }
        type="text"
      />
    </div>
  )
}
