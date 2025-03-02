import { cn } from '@/utils/cn'
import type { ComponentProps } from 'react'
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form'
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'

export type FieldClassnames = {
  root?: string
  label?: string
  description?: string
  error?: string
}

export function ArrayField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ComponentProps<typeof Field<TFieldValues, TName>>) {
  const classNames = props.hideLabel
    ? {
        root: 'flex flex-col',
        label: '-order-3',
        description: '-order-2',
        error:
          '-order-1 mb-4 border bg-red-50 border-destructive p-2 rounded-md',
      }
    : {
        root: 'relative',
        error: 'absolute right-0 top-0 mt-0.5! text-sm',
      }
  return <Field classNames={classNames} {...props} />
}

export default function Field<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  description,
  form,
  label,
  name,
  render,
  hideLabel,
  classNames,
}: {
  description?: string
  form: UseFormReturn<TFieldValues>
  label: string
  name: TName
  render: ControllerProps<TFieldValues, TName>['render']
  hideLabel?: boolean
  classNames?: FieldClassnames
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={(renderProps) => (
        <FormItem
          className={cn(
            hideLabel && !description ? '' : 'space-y-2',
            classNames?.root,
          )}
        >
          <FormLabel
            className={cn(hideLabel ? 'sr-only' : '', classNames?.label)}
          >
            {label}
          </FormLabel>
          {render(renderProps)}
          {description && (
            <FormDescription className={classNames?.description}>
              {description}
            </FormDescription>
          )}
          <FormMessage className={classNames?.error} />
        </FormItem>
      )}
    />
  )
}
