import type { FormOption } from '@/types'
import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'
import { Checkbox } from '../ui/checkbox'
import { FormControl, FormDescription, FormItem, FormLabel } from '../ui/form'

export default function CheckboxesInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	field,
	options,
}: {
	field: ControllerRenderProps<TFieldValues, TName>
	options: FormOption[]
}) {
	const value = (field.value || []) as string[]
	return (
		<div className="space-y-3">
			{options.map((option) => (
				<FormItem key={option.value} className="items-top flex gap-2">
					<FormControl>
						<Checkbox
							name={field.name}
							value={option.value}
							disabled={field.disabled}
							checked={value.includes(option.value)}
							onCheckedChange={(checked) => {
								return checked
									? field.onChange([...value, option.value])
									: field.onChange(
											value.filter(
												(selectedOption) => selectedOption !== option.value,
											),
										)
							}}
						/>
					</FormControl>
					<div className="space-y-1.5 leading-none">
						<FormLabel className="font-normal">{option.label}</FormLabel>
						{option.description && (
							<FormDescription className="text-sm text-muted-foreground">
								{option.description}
							</FormDescription>
						)}
					</div>
				</FormItem>
			))}
		</div>
	)
}
