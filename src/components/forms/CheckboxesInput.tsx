import type { FormOption } from '@/types'
import { cn } from '@/utils/cn'
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form'
import { buttonVariants } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { FormControl, FormDescription, FormItem, FormLabel } from '../ui/form'

export default function CheckboxesInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  options,
  className,
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  options: FormOption[]
  className?: string
}) {
  const value = (field.value || []) as string[]
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const isChecked = value.includes(option.value)
        return (
          <FormItem
            key={option.value}
            className={buttonVariants({
              tone: isChecked ? 'primary' : 'neutral',
              mode: 'outline',
              size: 'xs',
              className:
                'relative focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            })}
          >
            <div className={isChecked ? '' : 'sr-only'}>
              <FormControl>
                <Checkbox
                  name={field.name}
                  value={option.value}
                  disabled={field.disabled}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    return checked
                      ? field.onChange([...value, option.value])
                      : field.onChange(
                          value.filter(
                            (selectedOption) => selectedOption !== option.value,
                          ),
                        )
                  }}
                  className={'block focus-visible:ring-0'}
                />
              </FormControl>
            </div>
            <div className="space-y-1.5 leading-none">
              {/*
							The `::after` pseudo element will span the whole parent button-like <FormItem>
							so that the whole area is clickable.
						 */}
              <FormLabel className="cursor-pointer font-normal after:absolute after:inset-0 after:block after:content-['']">
                {option.label}
              </FormLabel>
              {option.description && (
                <FormDescription className="text-sm text-muted-foreground">
                  {option.description}
                </FormDescription>
              )}
            </div>
          </FormItem>
        )
      })}
    </div>
  )
}
