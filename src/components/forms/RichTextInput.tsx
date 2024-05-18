import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'
import RichTextEditor from '../RichTextEditor/RichTextEditor'

export default function RichTextInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	field,
	placeholder = '',
}: {
	field: ControllerRenderProps<TFieldValues, TName>
	placeholder?: string
}) {
	return (
		<RichTextEditor
			placeholder={placeholder}
			onChange={field.onChange}
			editorState={field.value}
			type="formTextarea"
			disabled={field.disabled ?? false}
		/>
	)
}
