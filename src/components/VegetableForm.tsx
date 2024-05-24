'use client'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	VegetableData,
	type VegetableForDB,
	type VegetableInForm,
} from '@/schemas'
import type { VegetableUsage } from '@/types'
import { effectSchemaResolverResolver } from '@/utils/effectSchemaResolver'
import { generateId } from '@/utils/ids'
import {
	EDIBLE_PART_TO_LABEL,
	GENDER_TO_LABEL,
	PLANTING_METHOD_TO_LABEL,
	STRATUM_TO_LABEL,
	USAGE_TO_LABEL,
	VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { SendIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
	FormProvider,
	type SubmitHandler,
	useForm,
	useFormContext,
} from 'react-hook-form'
import ArrayInput from './forms/ArrayInput'
import CheckboxesInput from './forms/CheckboxesInput'
import Field from './forms/Field'
import HandleInput from './forms/HandleInput'
import ImageInput from './forms/ImageInput'
import NumberInput from './forms/NumberInput'
import RadioGroupInput from './forms/RadioGroupInput'
import ReferenceListInput from './forms/ReferenceListInput'
import RichTextInput from './forms/RichTextInput'
import SourceInput from './forms/SourceInput'
import VegetableTipInput from './forms/VegetableTipInput'
import VegetableVarietyInput from './forms/VegetableVarietyInput'
import Carrot from './icons/Carrot'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Text } from './ui/text'
import { useToast } from './ui/use-toast'

export default function VegetableForm(props: {
	onSubmit: (
		vegetable: VegetableForDB,
	) => Promise<
		{ success: true; redirectTo: string } | { success: false; error: string }
	>
	initialValue?: VegetableInForm
}) {
	const router = useRouter()
	const toast = useToast()
	const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
		'idle',
	)
	const form = useForm<VegetableInForm>({
		resolver: effectSchemaResolverResolver(VegetableData),
		criteriaMode: 'all',
		defaultValues:
			'initialValue' in props
				? props.initialValue
				: {
						id: generateId(),
					},
		mode: 'onBlur',
		disabled: status !== 'idle',
	})

	const onSubmit: SubmitHandler<VegetableInForm> = async (data) => {
		setStatus('submitting')
		const result = await props.onSubmit(data as unknown as VegetableForDB)
		if (result.success) {
			toast.toast({
				variant: 'default',
				title: 'Vegetal criado com sucesso ✨',
				description: 'Te enviando pra página dele...',
			})
			router.push(result.redirectTo)
			setStatus('success')
		} else {
			toast.toast({
				variant: 'destructive',
				title: 'Erro ao adicionar vegetal',
				description: 'Por favor, tente novamente.',
			})
			setStatus('idle')
		}
	}

	if (status === 'success') {
		return (
			<main
				className="h-full flex items-center justify-center"
				aria-live="polite"
			>
				<Card className="space-y-4 px-5 py-3">
					<CardHeader>
						<CardTitle>Vegetal criado com sucesso!</CardTitle>
					</CardHeader>
					<CardContent>
						<Text className="flex justify-center items-center gap-3">
							<Carrot className="animate-spin h-6 w-6" /> Te levando pra página
							do vegetal...
						</Text>
					</CardContent>
				</Card>
			</main>
		)
	}

	return (
		<main className="px-pageX py-pageY relative">
			<FormProvider {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="max-w-[90rem] flex flex-wrap gap-4"
				>
					<div className="flex items-center gap-4">
						<h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
							{props.initialValue
								? `Editar ${props.initialValue.names?.[0]?.value || 'vegetal'}`
								: 'Criar vegetal'}
						</h1>
						<Button type="submit" disabled={form.formState.disabled}>
							<SendIcon className="w-[1.25em]" /> Enviar
						</Button>
					</div>
					<div className="grid gap-4 md:grid-cols-[1fr_350px] lg:grid-cols-3 lg:gap-8 items-start relative">
						<div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8 md:sticky md:top-4">
							<Card>
								<CardHeader>
									<CardTitle>Visão geral</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									<Field
										label="Nomes"
										name="names"
										form={form}
										render={({ field }) => (
											<ArrayInput
												field={field}
												newItemValue={{ value: '' }}
												newItemLabel="Novo nome"
												renderItem={(index) => (
													<Field
														form={form}
														name={`${field.name}.${index}.value`}
														label={`Nome ${index + 1}`}
														hideLabel
														render={({ field: subField }) => (
															<Input {...subField} />
														)}
													/>
												)}
											/>
										)}
									/>
									<Field
										form={form}
										name="handle"
										label="Endereço no site"
										render={({ field }) => (
											<HandleInput field={field} path="vegetais" />
										)}
									/>
									<Field
										label="Nomes científicos"
										name="scientific_names"
										form={form}
										render={({ field }) => (
											<ArrayInput
												field={field}
												newItemValue={{ value: '' }}
												newItemLabel="Novo nome científico"
												renderItem={(index) => (
													<Field
														form={form}
														name={`${field.name}.${index}.value`}
														label={`Nome científico ${index + 1}`}
														hideLabel
														render={({ field: subField }) => (
															<Input {...subField} />
														)}
													/>
												)}
											/>
										)}
									/>
									<Field
										form={form}
										name="origin"
										label="Origem"
										render={({ field }) => (
											<Input {...field} value={field.value || ''} type="text" />
										)}
									/>
									<div className="grid grid-cols-2 gap-4">
										<Field
											form={form}
											name="height_min"
											label="Altura adulta mínima"
											render={({ field }) => (
												<NumberInput field={field} format="centimeters" />
											)}
										/>
										<Field
											form={form}
											name="height_max"
											label="Altura adulta máxima"
											render={({ field }) => (
												<NumberInput field={field} format="centimeters" />
											)}
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<Field
											form={form}
											name="temperature_min"
											label="Temperatura ideal mínima"
											render={({ field }) => (
												<NumberInput field={field} format="temperature" />
											)}
										/>
										<Field
											form={form}
											name="temperature_max"
											label="Temperatura ideal máxima"
											render={({ field }) => (
												<NumberInput field={field} format="temperature" />
											)}
										/>
									</div>
									<Field
										form={form}
										name="friends"
										label="Amigues"
										description="Plantas que gostam de serem plantadas e estarem próximas. Simbioses e consórcios também entram :)"
										render={({ field }) => (
											<ReferenceListInput
												field={field}
												objectType="Vegetable"
											/>
										)}
									/>
									<Field
										form={form}
										name="content"
										label="Conteúdo livre sobre o vegetal"
										render={({ field }) => (
											<RichTextInput
												field={field}
												placeholder="Alguma curiosidade, história, ritual, ou dica solta que gostaria de compartilhar?"
											/>
										)}
									/>
									<Field
										form={form}
										label="Fontes"
										name={'sources'}
										render={({ field: sourcesField }) => (
											<ArrayInput
												field={sourcesField}
												newItemValue={{}}
												newItemLabel="Nova fonte"
												renderItem={(index) => (
													<Field
														form={form}
														name={`${sourcesField.name}.${index}`}
														label={`Fonte #${index + 1}`}
														hideLabel
														render={({ field: subField }) => (
															<SourceInput
																field={subField}
																label="informação"
															/>
														)}
													/>
												)}
											/>
										)}
									/>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Fotos</CardTitle>
								</CardHeader>
								<CardContent>
									<Field
										form={form}
										name="photos"
										label="Fotos"
										hideLabel
										render={({ field }) => {
											return (
												<ArrayInput
													field={field}
													newItemValue={{}}
													newItemLabel="Nova foto"
													renderItem={(index) => (
														<Field
															form={form}
															name={`${field.name}.${index}`}
															label={`Foto #${index + 1}`}
															hideLabel
															render={({ field: subField }) => (
																<ImageInput field={subField} />
															)}
														/>
													)}
												/>
											)
										}}
									/>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Variedades</CardTitle>
								</CardHeader>
								<CardContent>
									<Field
										form={form}
										name="varieties"
										label="Variedades"
										hideLabel
										render={({ field }) => {
											return (
												<ArrayInput
													field={field}
													newItemValue={{
														names: [{ value: '' }],
													}}
													newItemLabel="Nova variedade"
													inputType="dialog"
													renderItem={(index) => (
														<Field
															form={form}
															name={`${field.name}.${index}`}
															label={`Variedade #${index + 1}`}
															hideLabel
															render={({ field: subField }) => (
																<VegetableVarietyInput
																	index={index}
																	field={subField}
																/>
															)}
														/>
													)}
												/>
											)
										}}
									/>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Dicas</CardTitle>
								</CardHeader>
								<CardContent>
									<Field
										form={form}
										name="tips"
										label="Dicas"
										hideLabel
										render={({ field }) => {
											return (
												<ArrayInput
													field={field}
													newItemValue={{}}
													newItemLabel="Nova dica"
													inputType="dialog"
													renderItem={(index) => (
														<Field
															form={form}
															name={`${field.name}.${index}`}
															label={`Dica #${index + 1}`}
															hideLabel
															render={({ field: subField }) => (
																<VegetableTipInput
																	index={index}
																	field={subField}
																/>
															)}
														/>
													)}
												/>
											)
										}}
									/>
								</CardContent>
							</Card>
						</div>
						<div className="grid auto-rows-max items-start gap-4 lg:gap-8 md:sticky md:top-4">
							<Card className="overflow-hidden">
								<CardHeader>
									<CardTitle>Propriedades</CardTitle>
									<CardDescription>
										Informações básicas sobre o uso e características do
										vegetal.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<Field
										form={form}
										name="gender"
										label="Gênero gramatical"
										render={({ field }) => (
											<RadioGroupInput
												field={field}
												options={Object.entries(GENDER_TO_LABEL).map(
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
										name="uses"
										label="Principais usos"
										render={({ field }) => (
											<CheckboxesInput
												field={field}
												options={Object.entries(USAGE_TO_LABEL).map(
													([value, label]) => ({
														value,
														label,
													}),
												)}
											/>
										)}
									/>
									<EdibleParts />
									<Field
										form={form}
										name="lifecycles"
										label="Ciclo de vida"
										render={({ field }) => (
											<CheckboxesInput
												field={field}
												options={Object.entries(
													VEGETABLE_LIFECYCLE_TO_LABEL,
												).map(([value, label]) => ({ value, label }))}
											/>
										)}
									/>
									<Field
										form={form}
										name="strata"
										label="Estrato de cultivo"
										render={({ field }) => (
											<CheckboxesInput
												field={field}
												options={Object.entries(STRATUM_TO_LABEL).map(
													([value, label]) => ({ value, label }),
												)}
											/>
										)}
									/>
									<Field
										form={form}
										name="planting_methods"
										label="Plantio por"
										render={({ field }) => (
											<CheckboxesInput
												field={field}
												options={Object.entries(PLANTING_METHOD_TO_LABEL).map(
													([value, label]) => ({ value, label }),
												)}
											/>
										)}
									/>
								</CardContent>
							</Card>
						</div>
					</div>
				</form>
			</FormProvider>
		</main>
	)
}

function EdibleParts() {
	const form = useFormContext()
	const uses = (form.watch('uses') || []) as VegetableUsage[]

	if (!uses.includes('ALIMENTO_HUMANO')) return null

	return (
		<Field
			form={form}
			name="edible_parts"
			label="Partes comestíveis"
			render={({ field }) => (
				<CheckboxesInput
					field={field}
					options={Object.entries(EDIBLE_PART_TO_LABEL).map(
						([value, label]) => ({ value, label }),
					)}
				/>
			)}
		/>
	)
}