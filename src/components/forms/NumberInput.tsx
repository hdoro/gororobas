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
          className="pointer-events-none absolute inset-y-0 flex items-center overflow-hidden pl-3 text-sm font-normal text-ellipsis whitespace-nowrap text-stone-600 select-none"
          style={{
            left: `calc(${
              // Incrementally reduce the multiplier because, otherwise, for some reason the format gets further and further from the input as the number grows
              (value?.toString().length || 1) ** 0.9
            } * 1ch)`,
            right: 0,
          }}
        >
          {formatNumber(value, format).replace(`${value} `, '')}
        </div>
      ) : null}
    </div>
  )
}
