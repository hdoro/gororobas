import type { FormOption } from '@/types'
import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'
import { FormControl, FormItem, FormLabel } from '../ui/form'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'

export default function RadioGroupInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	field,
	options,
}: {
	field: ControllerRenderProps<TFieldValues, TName>
	options: FormOption[]
}) {
	return (
		<RadioGroup
			defaultValue={field.value}
			onValueChange={(newValue) => field.onChange(newValue)}
		>
			{options.map((option) => {
				return (
					<FormItem key={option.value} className="flex items-center gap-2">
						<FormControl>
							<RadioGroupItem value={option.value} disabled={field.disabled} />
						</FormControl>

						<div className="space-y-1.5 leading-none">
							<FormLabel className="font-normal">{option.label}</FormLabel>
							{option.description && (
								<p className="text-sm text-muted-foreground">
									{option.description}
								</p>
							)}
						</div>
					</FormItem>
				)
			})}
		</RadioGroup>
	)
}
