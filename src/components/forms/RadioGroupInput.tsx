import type { FormOption } from '@/types'
import type { DeepKeys, FieldApi } from '@tanstack/react-form'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { getFieldId, getFieldProps } from './form.utils'

export default function RadioGroupInput<
  FormValue extends Record<string, any>,
  FieldName extends DeepKeys<FormValue>,
>({
  field,
  options,
}: {
  field: FieldApi<FormValue, FieldName>
  options: FormOption[]
}) {
  const value = (field.state.value as string) || ''

  return (
    <RadioGroup
      defaultValue={value}
      onValueChange={(newValue) =>
        field.handleChange(newValue as typeof field.state.value)
      }
    >
      {options.map((option) => {
        const id = `${getFieldId(field)}-${option.value}`
        return (
          <div key={id} className="flex items-center gap-2">
            <RadioGroupItem
              {...getFieldProps(field)}
              value={option.value}
              id={id}
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
    </RadioGroup>
  )
}
