import { type NumberFormat, formatNumber } from '@/utils/numbers'
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form'
import { FormControl } from '../ui/form'
import { Input } from '../ui/input'

export default function NumberInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  format = 'none',
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  format?: NumberFormat
}) {
  const value = Number(field.value)
  return (
    <div className="relative">
      <FormControl>
        <Input
          {...field}
          value={value || ''}
          onChange={(e) => field.onChange(Number(e.target.value))}
          type="number"
        />
      </FormControl>
      {value && format !== 'none' ? (
        <div
          className="pointer-events-none absolute inset-y-0 flex select-none items-center overflow-hidden text-ellipsis whitespace-nowrap pl-3 text-sm font-normal text-stone-600"
          style={{
            left: `calc(${value?.toString().length || 1} * 0.85ch)`,
            right: 0,
          }}
        >
          {formatNumber(value, format).replace(`${value} `, '')}
        </div>
      ) : null}
    </div>
  )
}
