'use client'

import { createNotesAction } from '@/actions/createNotes.action'
import BooleanInput, {
	BOOLEAN_FIELD_CLASSNAMES,
} from '@/components/forms/BooleanInput'
import CheckboxesInput from '@/components/forms/CheckboxesInput'
import Field from '@/components/forms/Field'
import RichTextInput from '@/components/forms/RichTextInput'
import Carrot from '@/components/icons/Carrot'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useToast } from '@/components/ui/use-toast'
import { NoteData, type NoteForDB, type NoteInForm } from '@/schemas'
import { effectSchemaResolverResolver } from '@/utils/effectSchemaResolver'
import { generateId } from '@/utils/ids'
import { NOTE_TYPE_TO_LABEL } from '@/utils/labels'
import { paths } from '@/utils/urls'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, type SubmitHandler, useForm } from 'react-hook-form'

export default function NoteForm() {
	const router = useRouter()
	const toast = useToast()
	const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
		'idle',
	)

	const form = useForm<NoteInForm>({
		resolver: effectSchemaResolverResolver(NoteData),
		criteriaMode: 'all',
		defaultValues: {
			id: generateId(),
			public: true,
			published_at: new Date().toISOString(),
		},
		mode: 'onBlur',
		disabled: status === 'submitting',
	})

	const onSubmit: SubmitHandler<NoteInForm> = async (data, event) => {
		const decodedData = data as unknown as NoteForDB

		setStatus('submitting')
		const response = await createNotesAction([decodedData])
		if (response.success === true && response.result[0]?.handle) {
			toast.toast({
				variant: 'default',
				title: 'Nota criada ✨',
				description: 'Te enviando pra página dela...',
			})
			router.push(paths.note(response.result[0].handle))
			setStatus('success')
		} else {
			toast.toast({
				variant: 'destructive',
				title: 'Erro ao criar a nota',
				description: 'Por favor, tente novamente.',
			})
			setStatus('idle')
		}
	}

	if (status === 'success') {
		return (
			<main
				className="h-full flex items-center justify-center text-center"
				aria-live="polite"
			>
				<div className="space-y-4">
					<Text level="h1" as="h1">
						Nota criada com sucesso!
					</Text>
					<Text
						level="h2"
						as="p"
						className="flex justify-center items-center gap-3"
					>
						<Carrot className="animate-spin h-6 w-6" /> Te levando pra página da
						nota...
					</Text>
				</div>
			</main>
		)
	}

	return (
		<main className="h-full pt-6">
			<FormProvider {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					aria-disabled={form.formState.disabled}
					className={`
					flex h-full flex-col md:flex-row md:items-start gap-6
					md:px-pageX
					`}
				>
					<div
						className={`space-y-6 px-pageX flex-[5] max-w-3xl
					md:rounded-lg md:border md:bg-card md:text-card-foreground md:shadow-sm md:p-6
					`}
					>
						<Field
							form={form}
							name="title"
							hideLabel
							label="Título da nota"
							render={({ field }) => (
								<RichTextInput
									field={field}
									placeholder="O que experimentou, aprendeu ou descobriu hoje?"
									type="noteTitle"
									characterLimit={240}
								/>
							)}
						/>
						<Field
							form={form}
							name="types"
							hideLabel
							label="Tipo(s) da nota"
							render={({ field }) => (
								<CheckboxesInput
									field={field}
									options={Object.entries(NOTE_TYPE_TO_LABEL).map(
										([value, label]) => ({
											value,
											label,
										}),
									)}
								/>
							)}
						/>
						<Field
							form={form}
							name="body"
							hideLabel
							label="Corpo"
							render={({ field }) => (
								<RichTextInput
									field={field}
									placeholder="Algo mais que gostaria de escrever sobre?"
									type="noteBody"
								/>
							)}
						/>
					</div>
					<div className="flex-1 md:hidden" />

					<div
						className={`
						flex gap-4 items-center justify-between md:flex-col-reverse md:items-start
						bg-background-card md:bg-transparent border-t border-t-primary-100 md:border-t-0
						px-pageX py-4 md:p-0`}
					>
						<Field
							form={form}
							name="public"
							label="Pública"
							classNames={BOOLEAN_FIELD_CLASSNAMES}
							render={({ field }) => <BooleanInput field={field} />}
						/>
						<Button size="lg" type="submit" disabled={form.formState.disabled}>
							Enviar
						</Button>
					</div>
				</form>
			</FormProvider>
		</main>
	)
}
