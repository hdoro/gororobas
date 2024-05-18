import type { ImageData } from '@/schemas'
import { CircleXIcon } from 'lucide-react'
import {
	useFormContext,
	useWatch,
	type ControllerRenderProps,
	type FieldPath,
	type FieldValues,
} from 'react-hook-form'
import { SanityImage } from '../SanityImage'
import { Button } from '../ui/button'
import { FormControl } from '../ui/form'
import { Input } from '../ui/input'
import ArrayInput from './ArrayInput'
import Field from './Field'
import ImageDropzone from './ImageDropzone'
import SourceInput from './SourceInput'

export default function ImageInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	field: rootField,
	includeMetadata = true,
}: {
	field: ControllerRenderProps<TFieldValues, TName>
	includeMetadata?: boolean
}) {
	const form = useFormContext()
	const dataFieldName = `${rootField.name}.data`
	const imageData = useWatch({
		control: form.control,
		name: dataFieldName,
	}) as (typeof ImageData.Encoded)['data'] | null | undefined

	const ImageField = () => {
		if (imageData && 'sanity_id' in imageData && imageData.sanity_id) {
			return (
				<Field
					form={form}
					label="Imagem"
					hideLabel
					name={dataFieldName}
					render={({ field }) => {
						function clearField() {
							field.onChange(undefined)
						}
						return (
							<div className="relative aspect-square border-2 border-border bg-card w-[12.5rem] flex-[0_0_max-content] flex items-center justify-center rounded-lg">
								<FormControl>
									<Button
										onClick={clearField}
										className="absolute top-2 right-2 rounded-full"
										aria-label="Remover imagem"
										tone="destructive"
										mode="outline"
										size="icon"
									>
										<CircleXIcon className="stroke-current" />
									</Button>
								</FormControl>
								<SanityImage image={imageData} maxWidth={200} />
							</div>
						)
					}}
				/>
			)
		}

		return (
			<Field
				form={form}
				label="Imagem"
				hideLabel
				name={`${dataFieldName}.file`}
				render={({ field }) => <ImageDropzone field={field} />}
			/>
		)
	}

	if (!includeMetadata) {
		return <ImageField />
	}

	return (
		<div className="flex gap-6 items-start flex-wrap">
			<div className="flex-[0_0_12.5rem]">
				<ImageField />
			</div>
			<div className="space-y-4 flex-1">
				<Field
					form={form}
					label="Rótulo"
					name={`${rootField.name}.label`}
					render={({ field: labelField }) => (
						<Input
							{...labelField}
							value={labelField.value || ''}
							type="text"
							placeholder="Sobre o que é a imagem?"
						/>
					)}
				/>
				<Field
					form={form}
					label="Fontes"
					name={`${rootField.name}.sources`}
					render={({ field: sourcesField }) => (
						<ArrayInput
							field={sourcesField}
							// @ts-expect-error no way for TS to know the type of `newItemValue`
							newItemValue={{}}
							newItemLabel="Nova fonte"
							renderItem={(index) => (
								<Field
									form={form}
									name={`${sourcesField.name}.${index}`}
									label={`Fonte #${index + 1}`}
									hideLabel
									render={({ field: subField }) => (
										<SourceInput field={subField} label="imagem" />
									)}
								/>
							)}
						/>
					)}
				/>
			</div>
		</div>
	)
}
