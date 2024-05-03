import { formatCentimeters } from '@/utils/numbers'
import { Input } from '../ui/input'
import type { DeepKeys, FieldApi } from '@tanstack/react-form'
import { getFieldId } from './form.utils'

export default function NumberInput<
  FormValue extends Record<string, any>,
  FieldName extends DeepKeys<FormValue>,
>({
  field,
  format = 'none',
}: {
  field: FieldApi<FormValue, FieldName>
  format?: 'none' | 'centimeters' | 'temperature'
}) {
  const value = Number(field.state.value)
  return (
    <div className="relative">
      <Input
        name={field.name}
        id={getFieldId(field)}
        value={value || ''}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange(Number(e.target.value) as typeof field.state.value)
        }
        type="number"
      />
      {value && format !== 'none' ? (
        <div
          className="absolute inset-y-0 flex items-center pl-3 text-sm text-gray-600 select-none font-normal"
          style={{
            left: `calc(${value?.toString().length || 1} * 1ch)`,
          }}
        >
          {format === 'centimeters' && (
            <>
              cm{' '}
              {!Number.isNaN(value) &&
                value >= 100 &&
                `(${formatCentimeters(value)})`}
            </>
          )}
          {format === 'temperature' && <>ºC</>}
        </div>
      ) : null}
    </div>
  )
}
