import type { FormOption } from '@/types'
import type { DeepKeys, FieldApi } from '@tanstack/react-form'
import { Checkbox } from '../ui/checkbox'
import { getFieldId } from './form.utils'
import type { CheckedState } from '@radix-ui/react-checkbox'
import { useCallback } from 'react'
import { Label } from '../ui/label'

export default function CheckboxesInput<
  FormValue extends Record<string, any>,
  FieldName extends DeepKeys<FormValue>,
>({
  field,
  options,
}: {
  field: FieldApi<FormValue, FieldName>
  options: FormOption[]
}) {
  const value = (field.state.value as Array<string>) || []
  const { handleChange } = field

  const toggleOption = useCallback(
    (optionValue: string) => {
      return (checked: CheckedState) => {
        const isChecked = checked === true // treating indeterminate as `false`

        const newValue = isChecked
          ? [...value, optionValue]
          : value.filter((v) => v !== optionValue)
        handleChange(newValue as typeof field.state.value)
      }
    },
    [handleChange, value],
  )

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const id = `${getFieldId(field)}-${option.value}`
        return (
          <div className="items-top flex gap-2">
            <Checkbox
              id={id}
              name={field.name}
              value={option.value}
              checked={value.includes(option.value)}
              onCheckedChange={toggleOption(option.value)}
            />
            <div className="space-y-1.5 leading-none">
              <Label htmlFor={id} className="font-normal">
                {option.label}
              </Label>
              {option.description && (
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
