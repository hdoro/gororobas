import type { RangeFormValue } from '@/schemas'
import { cn } from '@/utils/cn'
import * as SliderPrimitive from '@radix-ui/react-slider'
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form'
import { FormControl } from '../ui/form'

export default function SliderRangeInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  min = 0,
  max,
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  min: number
  max: number
  step: number
}) {
  const inputValue = (field.value || [min, max]) as typeof RangeFormValue.Type
  const values = [inputValue[0] || min, inputValue[1] || max]

  return (
    <FormControl>
      <SliderPrimitive.Root
        className={cn(
          'relative my-2 flex w-full max-w-md touch-none select-none items-center',
        )}
        max={max}
        step={1}
        value={values}
        onValueChange={([newMin, newMax]) => {
          field.onChange([
            newMin === min ? undefined : newMin,
            newMax === max ? undefined : newMax,
          ])
        }}
        minStepsBetweenThumbs={1}
      >
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full border bg-stone-100">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </FormControl>
  )
}
