import { slugify } from '@/utils/strings'
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form'
import { Input } from '../ui/input'

export default function HandleInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  path,
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  path: string
}) {
  return (
    <div className="@container flex">
      <div
        className={
          'bg-foreground/5 hidden h-10 flex-[0_0_max-content] items-center rounded-l-md rounded-r-none border px-3 py-2 text-sm @xs:block'
        }
      >
        gororobas.com/{path}/
      </div>
      <Input
        {...field}
        type="text"
        onBlur={(e) => {
          field.onChange(
            slugify(e.target.value as string) as typeof field.value,
          )
          field.onBlur()
        }}
        className="rounded-l-none rounded-r-md"
        value={field.value || ''}
      />
    </div>
  )
}
