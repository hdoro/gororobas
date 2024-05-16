import {
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import type { VegetableTipInForm } from '@/schemas'
import { TIP_SUBJECT_TO_LABEL } from '@/utils/labels'
import { semanticListItems } from '@/utils/strings'
import {
	type ControllerRenderProps,
	type FieldPath,
	type FieldValues,
	useFormContext,
} from 'react-hook-form'
import TipTapRenderer from '../TipTapRenderer'
import { Button } from '../ui/button'
import { FormControl } from '../ui/form'
import { Text } from '../ui/text'
import CheckboxesInput from './CheckboxesInput'
import Field from './Field'
import RichTextInput from './RichTextInput'
import SourceInput from './SourceInput'

export default function VegetableTipInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	field: rootField,
	index: tipIndex,
}: {
	field: ControllerRenderProps<TFieldValues, TName>
	index: number
}) {
	const form = useFormContext()
	const freshValue = form.watch(rootField.name)
	const value = (freshValue || {}) as Partial<VegetableTipInForm>
	const { subjects = [], content } = value

	return (
		<Dialog>
			<FormControl>
				<DialogTrigger
					className="block w-full h-full bg-gray-50 p-3 border rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					data-array-item-field-name={rootField.name}
				>
					<div className="space-y-1 text-left">
						<Text
							level="sm"
							weight="semibold"
							as="h2"
							className={subjects[0] ? '' : 'text-muted-foreground'}
						>
							{subjects?.length > 0
								? semanticListItems(
										subjects.map((s) => TIP_SUBJECT_TO_LABEL[s]),
									)
								: 'Sem assunto definido'}
						</Text>
						{content && <TipTapRenderer content={content} />}
					</div>
				</DialogTrigger>
			</FormControl>
			<DialogContent hasClose={false}>
				<DialogHeader>
					<DialogTitle>
						Editar dica {typeof tipIndex === 'number' && `#${tipIndex + 1}`}
					</DialogTitle>
					<DialogClose asChild>
						<Button variant="outline" size="sm" tabIndex={0}>
							Fechar
						</Button>
					</DialogClose>
				</DialogHeader>
				<DialogBody className="space-y-6">
					<Field
						form={form}
						name={`${rootField.name}.content`}
						label="Dica ou recomendação"
						render={({ field }) => (
							<RichTextInput
								field={field}
								placeholder="Truques, cuidados, surpresas ou sugestão que gostaria de compartilhar?"
							/>
						)}
					/>
					<div className="grid grid-cols-2 gap-4">
						<Field
							form={form}
							name={`${rootField.name}.subjects`}
							label="Assunto(s)"
							render={({ field }) => (
								<CheckboxesInput
									field={field}
									options={Object.entries(TIP_SUBJECT_TO_LABEL).map(
										([value, label]) => ({
											value,
											label,
										}),
									)}
								/>
							)}
						/>
						<div className="space-y-3">
							<SourceInput field={rootField} label="Dica" />
						</div>
					</div>
				</DialogBody>
			</DialogContent>
		</Dialog>
	)
}
