import { cn } from '@/utils/cn'
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
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
