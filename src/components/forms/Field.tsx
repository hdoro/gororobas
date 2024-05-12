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
	hideLabel,
}: {
	description?: string
	form: UseFormReturn<TFieldValues>
	label: string
	name: TName
	render: ControllerProps<TFieldValues, TName>['render']
	// @TODO: improve this component API - perhaps tailwind-variants + slots?
	hideLabel?: boolean
}) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={(renderProps) => (
				<FormItem className={hideLabel && !description ? '' : 'space-y-2'}>
					<FormLabel className={hideLabel ? 'sr-only' : ''}>{label}</FormLabel>
					{render(renderProps)}
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
