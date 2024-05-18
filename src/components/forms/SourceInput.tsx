import type { SourceType } from '@/types'
import { SOURCE_TYPE_TO_LABEL } from '@/utils/labels'
import {
	type ControllerRenderProps,
	type FieldPath,
	type FieldValues,
	useFormContext,
} from 'react-hook-form'
import { Input } from '../ui/input'
import Field from './Field'
import RadioGroupInput from './RadioGroupInput'

export default function SourceInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	field,
	label,
}: { field: ControllerRenderProps<TFieldValues, TName>; label: string }) {
	const form = useFormContext()

	const sourceType = form.watch(`${field.name}.sourceType`) as SourceType
	return (
		<div className="space-y-4">
			<Field
				form={form}
				label={`Origem da ${label}`}
				name={`${field.name}.sourceType`}
				render={({ field: sourceTypeField }) => (
					<RadioGroupInput
						field={sourceTypeField}
						options={[
							{
								label: SOURCE_TYPE_TO_LABEL.EXTERNAL,
								value: 'EXTERNAL' satisfies SourceType,
							},
							{
								label: SOURCE_TYPE_TO_LABEL.GOROROBAS,
								value: 'GOROROBAS' satisfies SourceType,
							},
						]}
					/>
				)}
			/>
			{/* @TODO: Gororobas source (needs access to EdgeDB users) */}
			{sourceType === 'EXTERNAL' && (
				<>
					<Field
						form={form}
						label="Créditos"
						name={`${field.name}.credits`}
						render={({ field: creditsField }) => (
							<Input
								{...creditsField}
								value={creditsField.value || ''}
								type="text"
								placeholder={`Que pessoa ou organização produziu a ${label}?`}
							/>
						)}
					/>
					<Field
						form={form}
						label="Fonte"
						description="De preferência um link our URL"
						name={`${field.name}.source`}
						render={({ field: sourceField }) => (
							<Input
								{...sourceField}
								value={sourceField.value || ''}
								type="text"
								placeholder={`Ex: https://site.br/pagina-da-${label}`}
							/>
						)}
					/>
				</>
			)}
		</div>
	)
}
