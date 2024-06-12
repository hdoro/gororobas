import type { FormOption } from '@/types'
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
}: {
	field: ControllerRenderProps<TFieldValues, TName>
	options: FormOption[]
}) {
	const value = (field.value || []) as string[]
	return (
		<div className="flex gap-x-3 gap-y-2 flex-wrap">
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
							<FormLabel className="font-normal after:absolute after:content-[''] after:inset-0 after:block cursor-pointer">
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
