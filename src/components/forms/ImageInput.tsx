import {
	type ControllerRenderProps,
	type FieldPath,
	type FieldValues,
	useFormContext,
} from 'react-hook-form'
import { Input } from '../ui/input'
import Field from './Field'
import ImageDropzone from './ImageDropzone'
import SourceInput from './SourceInput'

export default function ImageInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ field }: { field: ControllerRenderProps<TFieldValues, TName> }) {
	const form = useFormContext()

	return (
		<div className="flex gap-6 items-start flex-wrap">
			<div className="flex-[0_0_12.5rem]">
				<Field
					form={form}
					label="Imagem"
					hideLabel
					name={`${field.name}.data.file`}
					render={({ field }) => <ImageDropzone field={field} />}
				/>
			</div>
			<div className="space-y-4 flex-1">
				<Field
					form={form}
					label="Rótulo"
					name={`${field.name}.label`}
					render={({ field: labelField }) => (
						<Input
							{...labelField}
							value={labelField.value || ''}
							type="text"
							placeholder="Sobre o que é a imagem?"
						/>
					)}
				/>
				<SourceInput field={field} label="imagem" />
			</div>
		</div>
	)
}
