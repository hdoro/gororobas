'use client'

import { cn } from '@/utils/cn'
import { CircleXIcon, UploadCloudIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import type {
	ControllerRenderProps,
	FieldPath,
	FieldValues,
} from 'react-hook-form'
import { Button } from '../ui/button'
import { FormControl, FormLabel } from '../ui/form'
import { useToast } from '../ui/use-toast'

const MAX_UPLOAD_SIZE = 3 * 1024 * 1024

export default function ImageDropzone<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ field }: { field: ControllerRenderProps<TFieldValues, TName> }) {
	const { toast } = useToast()

	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragAccept,
		isDragReject,
		rootRef,
	} = useDropzone({
		accept: {
			'image/*': ['.png', '.avif', '.jpg', '.jpeg', '.gif', '.webp'],
		},
		maxFiles: 1,
		maxSize: MAX_UPLOAD_SIZE,
		onDropRejected: (fileRejections) => {
			const fileRejection = fileRejections[0]
			if (fileRejection.errors[0].code === 'file-invalid-type') {
				toast({
					title: 'Arquivo inválido',
					description: 'Apenas imagens são aceitas.',
					variant: 'destructive',
				})
			} else if (fileRejection.errors[0].code === 'file-too-large') {
				toast({
					title: 'Imagem muito grande',
					description: 'Envie uma imagem de até 3MB.',
					variant: 'destructive',
				})
			}
		},
		onDropAccepted: (files) => {
			field.onChange(files[0])
		},
	})

	function clearField() {
		field.onChange(undefined)
		rootRef.current?.focus()
	}

	return (
		<div
			{...getRootProps()}
			className={cn(
				'relative aspect-square border-2 border-border bg-card w-[12.5rem] flex-[0_0_max-content] flex items-center justify-center rounded-lg',
				isDragActive && 'border-dotted',
				isDragAccept && 'bg-primary/15 border-primary/30',
				isDragReject && 'bg-destructive/15 border-destructive/30',
			)}
		>
			<FormControl>
				<input
					/**
					 * We can't make the input controlled by passing the field's value to `getInputProps`,
					 * else the File object will be accessed in unexpected ways, which break with the error:
					 * "InvalidStateError: An attempt was made to use an object that is not, or is no longer, usable"
					 */
					{...getInputProps({
						disabled: field.disabled,
						name: field.name,
						onBlur: field.onBlur,
						ref: field.ref,
					})}
					style={{}}
					className="sr-only"
				/>
			</FormControl>

			{field.value ? (
				<>
					{(field.value as File) instanceof File && (
						<img
							src={URL.createObjectURL(field.value)}
							alt="Imagem selecionada"
							className="block object-contain w-full h-full"
						/>
					)}
					<Button
						onClick={clearField}
						className="absolute top-2 right-2 rounded-full"
						aria-label="Remover imagem"
						variant="outline"
						size="icon"
					>
						<CircleXIcon />
					</Button>
				</>
			) : (
				<FormLabel className="flex flex-col items-center justify-center gap-1 text-xs text-center p-4 font-normal">
					<UploadCloudIcon />
					Clique aqui ou arraste a foto
				</FormLabel>
			)}
		</div>
	)
}
