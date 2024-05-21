import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'
import RichTextEditor from '../RichTextEditor/RichTextEditor'
import type { RichTextEditorThemeProps } from '../RichTextEditor/RichTextEditor.theme'

export default function RichTextInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	field,
	placeholder = '',
	type = 'formTextarea',
	characterLimit,
}: {
	field: ControllerRenderProps<TFieldValues, TName>
	placeholder?: string
	characterLimit?: number | undefined
} & RichTextEditorThemeProps) {
	return (
		<RichTextEditor
			type={type}
			placeholder={placeholder}
			onChange={field.onChange}
			editorState={field.value}
			disabled={field.disabled ?? false}
			characterLimit={characterLimit}
		/>
	)
}
