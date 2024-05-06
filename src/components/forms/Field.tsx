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

export default function Field<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  description,
  form,
  label,
  name,
  render,
}: {
  description?: string
  form: UseFormReturn<TFieldValues>
  label: string
  name: TName
  render: ControllerProps<TFieldValues, TName>['render']
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={(renderProps) => (
        <FormItem className="block space-y-2">
          <FormLabel>{label}</FormLabel>
          {render(renderProps)}
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
