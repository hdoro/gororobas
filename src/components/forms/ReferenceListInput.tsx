import {
	type ReferenceObjectType,
	listReferenceOptions,
} from '@/actions/listReferenceOptions'
import type { ReferenceOption } from '@/types'
import { cn } from '@/utils/cn'
import { CommandLoading } from 'cmdk'
import { CheckIcon, XIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'
import { SanityImage } from '../SanityImage'
import Carrot from '../icons/Carrot'
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from '../ui/command'
import { FormControl, FormItem, FormLabel } from '../ui/form'

export default function ReferenceListInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	field,
	objectType,
}: {
	field: ControllerRenderProps<TFieldValues, TName>
	objectType: ReferenceObjectType
}) {
	const [focused, setFocused] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const selected = (field.value || []) as ReferenceOption['id'][]
	const { options, optionsMap, error } = useReferenceOptions(objectType)

	function toggleOption(id: string) {
		if (selected.includes(id)) {
			field.onChange(selected.filter((selectedId) => selectedId !== id))
		} else {
			field.onChange([...selected, id])
			setSearchQuery('')
		}
	}

	const selectedOptions = selected.flatMap((id) => optionsMap[id] || [])

	const label = objectType === 'Vegetable' ? 'vegetais' : 'pessoas'
	return (
		<FormItem className={'border rounded-md'}>
			<Command
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				className="relative overflow-visible p-0"
			>
				<FormLabel className="font-normal sr-only">
					Busque por {label} no Gororobas
				</FormLabel>
				<FormControl>
					<CommandInput
						value={searchQuery}
						onValueChange={setSearchQuery}
						placeholder={`Busque por ${label} no Gororobas`}
						className="border-none p-0"
						disabled={field.disabled}
					/>
				</FormControl>
				<CommandList
					className={cn(
						'absolute w-full z-10 left-0 top-full translate-y-2 bg-card border rounded-md p-2',
						focused && !field.disabled ? '' : 'sr-only',
					)}
				>
					{!options && (
						<CommandLoading>
							<Carrot className="animate-spin h-6 w-6" /> Carregando
						</CommandLoading>
					)}
					<CommandEmpty className="flex items-center gap-2">
						Nenhum vegetal encontrado
					</CommandEmpty>
					{options?.map((option) => (
						<CommandItem
							key={option.id}
							className="flex items-center gap-2"
							value={option.id}
							keywords={[option.label]}
							onSelect={toggleOption}
						>
							{option.image && (
								<SanityImage
									image={option.image}
									maxWidth={24}
									className="w-6 h-6 rounded-full block object-cover"
									alt={`Foto de ${option.label}`}
								/>
							)}
							<span>{option.label}</span>
							{selected.includes(option.id) && (
								<CheckIcon className="w-4 h-4" />
							)}
						</CommandItem>
					))}
				</CommandList>
			</Command>
			{selectedOptions.length > 0 && (
				<div className="flex gap-2 flex-wrap min-h-10 p-2">
					{selectedOptions.map((option) => {
						return (
							<div
								key={option.id}
								className={cn(
									'border-2 rounded-full flex items-center text-sm gap-2 py-1 h-9',
									option.image ? 'px-1' : 'px-2',
								)}
							>
								{option.image && (
									<SanityImage
										image={option.image}
										maxWidth={24}
										className="w-6 h-6 rounded-full block object-cover"
										alt={`Foto de ${option.label}`}
									/>
								)}
								<span className="pr-1">{option.label}</span>
								<button
									className="button cursor-pointer rounded-full"
									type="button"
									onClick={() => toggleOption(option.id)}
									disabled={field.disabled}
								>
									<XIcon className="w-4 h-4" />
								</button>
							</div>
						)
					})}
				</div>
			)}
		</FormItem>
	)
}

function useReferenceOptions(objectType: ReferenceObjectType) {
	const [error, setError] = useState<string | null>(null)
	const [options, setOptions] = useState<ReferenceOption[] | null>(null)

	const optionsMap = useMemo(() => {
		return (options || []).reduce(
			(acc, option) => {
				acc[option.id] = option
				return acc
			},
			{} as Record<string, ReferenceOption>,
		)
	}, [options])

	const fetchOptions = useCallback(async () => {
		const fetchedOptions = await listReferenceOptions(objectType)
		if ('error' in fetchedOptions) {
			setError(fetchedOptions.error)
		} else {
			setOptions(fetchedOptions)
		}
	}, [objectType])

	useEffect(() => {
		fetchOptions()
	}, [fetchOptions])

	return {
		options,
		optionsMap,
		error,
	}
}
