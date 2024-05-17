import { formatCentimeters } from '@/utils/numbers'
import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'
import { Input } from '../ui/input'

export default function NumberInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	field,
	format = 'none',
}: {
	field: ControllerRenderProps<TFieldValues, TName>
	format?: 'none' | 'centimeters' | 'temperature'
}) {
	const value = Number(field.value)
	return (
		<div className="relative">
			<Input
				{...field}
				value={value || ''}
				onChange={(e) => field.onChange(Number(e.target.value))}
				type="number"
			/>
			{value && format !== 'none' ? (
				<div
					className="absolute inset-y-0 flex items-center pl-3 text-sm text-stone-600 select-none font-normal"
					style={{
						left: `calc(${value?.toString().length || 1} * 1ch)`,
					}}
				>
					{format === 'centimeters' && (
						<>
							cm{' '}
							{!Number.isNaN(value) &&
								value >= 100 &&
								`(${formatCentimeters(value)})`}
						</>
					)}
					{format === 'temperature' && 'ºC'}
				</div>
			) : null}
		</div>
	)
}
