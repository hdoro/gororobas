import { slugify } from '@/utils/strings'
import type { DeepKeys, FieldApi } from '@tanstack/react-form'
import { Input } from '../ui/input'
import { getFieldProps } from './form.utils'

export default function HandleInput<
  FormValue extends Record<string, any>,
  FieldName extends DeepKeys<FormValue>,
>({ field, path }: { field: FieldApi<FormValue, FieldName>; path: string }) {
  const value = (field.state.value as string) || ''
  return (
    <div className="flex">
      <div
        className={
          'h-10 w-full flex items-center rounded-l-md rounded-r-none border bg-foreground/5 px-3 py-2 text-sm flex-[0_0_max-content]'
        }
      >
        gororobas.com/{path}/
      </div>
      <Input
        {...getFieldProps(field)}
        type="text"
        value={value}
        onBlur={(e) => {
          field.handleChange(
            slugify(e.target.value as string) as typeof field.state.value,
          )
          field.handleBlur()
        }}
        onChange={(e) =>
          field.handleChange(e.target.value as typeof field.state.value)
        }
        className="rounded-r-md rounded-l-none"
      />
    </div>
  )
}
