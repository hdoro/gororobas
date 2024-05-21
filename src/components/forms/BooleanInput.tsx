import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'
import { FormControl } from '../ui/form'
import { Switch } from '../ui/switch'
import type { FieldClassnames } from './Field'

export const BOOLEAN_FIELD_CLASSNAMES: FieldClassnames = {
	root: 'flex items-center gap-2 space-y-0',
	label: 'order-1', // put the label after the switch
}

export default function BooleanInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	field,
}: {
	field: ControllerRenderProps<TFieldValues, TName>
}) {
	const value = Boolean(field.value)
	return (
		<FormControl>
			<Switch
				checked={value}
				onCheckedChange={field.onChange}
				disabled={field.disabled}
			/>
		</FormControl>
	)
}
