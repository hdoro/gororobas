import { addVegetable } from '@/actions/addVegetable'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Vegetable, type VegetableForDB, type VegetableInForm } from '@/schemas'
import type { VegetableUsage } from '@/types'
import { effectSchemaResolverResolver } from '@/utils/effectSchemaResolver'
import {
	EDIBLE_PART_TO_LABEL,
	GENDER_TO_LABEL,
	PLANTING_METHOD_TO_LABEL,
	STRATUM_TO_LABEL,
	USAGE_TO_LABEL,
	VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { ChevronLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
import RichTextInput from './forms/RichTextInput'
import VegetableVarietyInput from './forms/VegetableVarietyInput'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useToast } from './ui/use-toast'
import { generateId } from '@/utils/ids'

/**
 * FORM REQUIREMENTS:
 *
 * - [x] Submit
 * - [x] Different error messages for different validations
 * - [x] Optional fields
 *    - S.Optional() makes it hard to validate
 *    - Options:
 *      - Use S.Union
 *          - 👎 when there's one error, all error messages show
 *          - 👎 harder to use, less readable
 *      - Learn how to work with S.Optional() -> PropertySignatures went a bit over my head 🥴
 *      - Validate a S.struct with the optional field -> TS is complaining, but it works
 * - [x] Height field
 * - [x] Handle input
 * - [x] Different number formatters
 * - [x] Field IDs
 * - [x] Arrays
 * - [x] Validation
 * - [x] Objects
 * - [x] Arrays of objects
 * - [x] Form for photo with credits
 * - [x] Image input
 * - [x] Varieties
 * - [x] Rich text
 * - [x] Finish schema
 * - [x] Field dependency - edible_parts only if `ALIMENTO_HUMANO` in `usage`
 * - [x] Async validation
 * - [ ] Suggestions & tips
 * - [ ] Default values
 * - [ ] PhotoWithCredits: select person from Gororobas
 * - [ ] RTE: links, perhaps even to other entities in the DB
 *
 * ## IMPROVEMENTS
 * - [x] Better error messages for nested forms
 * - [ ] Numbers from text fields (I think number inputs have bunch of issues, don't remember why)
 * - [ ] When adding variety, automatically open form
 * - [ ] In the reoslver, can we validate the encoding schema instead of fully decoding it? It'd make it slightly faster.
 *
 */
export default function TestForm() {
	const form = useForm<VegetableInForm>({
		resolver: effectSchemaResolverResolver(Vegetable),
		criteriaMode: 'all',
		defaultValues: {
			id: generateId(),
		},
		mode: 'onBlur',
	})
	const router = useRouter()
	const toast = useToast()

	const onSubmit: SubmitHandler<VegetableInForm> = async (data, event) => {
		console.info({ data, event })
		const added = await addVegetable(data as unknown as VegetableForDB)
		if (added) {
			router.push(`/vegetais/${data.handle}`)
		} else {
			toast.toast({
				variant: 'destructive',
				title: 'Erro ao adicionar vegetal',
				description: 'Por favor, tente novamente.',
			})
		}
	}

	console.log(form.formState, form.getValues())

	return (
		<div className="flex min-h-screen w-full flex-col bg-bac-100/40 dark:bg-gray-800/40">
			<div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
				<main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
					<FormProvider {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="mx-auto grid max-w-[70rem] flex-1 auto-rows-max gap-4"
						>
							<div className="flex items-center gap-4">
								<Button className="h-7 w-7" size="icon" variant="outline">
									<ChevronLeftIcon className="h-4 w-4" />
									<span className="sr-only">Back</span>
								</Button>
								<h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
									Editar vegetal
								</h1>
								<div className="hidden items-center gap-2 md:ml-auto md:flex">
									<Button type="submit" size="sm">
										Enviar
									</Button>
								</div>
							</div>
							<div className="grid gap-4 md:grid-cols-[1fr_350px] lg:grid-cols-3 lg:gap-8 items-start relative">
								<div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8 sticky top-4">
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
													<Input
														{...field}
														value={field.value || ''}
														type="text"
													/>
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
												name="content"
												label="Conteúdo livre sobre o vegetal"
												render={({ field }) => (
													<RichTextInput
														field={field}
														placeholder="Alguma curiosidade, história, ritual, ou dica solta que gostaria de compartilhar?"
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
								</div>
								<div className="grid auto-rows-max items-start gap-4 lg:gap-8 sticky top-4">
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
														options={Object.entries(
															PLANTING_METHOD_TO_LABEL,
														).map(([value, label]) => ({ value, label }))}
													/>
												)}
											/>
										</CardContent>
									</Card>
								</div>
							</div>
							<div className="flex items-center justify-center gap-2 md:hidden">
								<Button size="sm" variant="outline">
									Discard
								</Button>
								<Button size="sm">Save Product</Button>
							</div>
						</form>
					</FormProvider>
				</main>
			</div>
		</div>
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
