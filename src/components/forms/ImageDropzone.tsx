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
>({
  field,
  value,
  clearValue,
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  value: File | null | undefined
  clearValue: () => void
}) {
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
      field.onBlur()
    },
  })

  function clearField() {
    clearValue()
    rootRef.current?.focus()
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative flex aspect-square w-[12.5rem] flex-[0_0_max-content] items-center justify-center rounded-lg border-2 border-border bg-card',
        isDragActive && 'border-dotted',
        isDragAccept && 'border-primary/30 bg-primary/15',
        isDragReject && 'border-destructive/30 bg-destructive/15',
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

      {value ? (
        <>
          {value instanceof File && (
            <img
              src={URL.createObjectURL(value)}
              alt="Imagem selecionada"
              className="block h-full w-full object-contain"
            />
          )}
          {!field.disabled && (
            <Button
              onClick={clearField}
              className="absolute right-2 top-2 rounded-full"
              aria-label="Remover imagem"
              tone="destructive"
              mode="outline"
              size="icon"
            >
              <CircleXIcon className="stroke-current" />
            </Button>
          )}
        </>
      ) : (
        <FormLabel className="flex flex-col items-center justify-center gap-1 p-4 text-center text-xs font-normal">
          <UploadCloudIcon />
          Clique aqui ou arraste a foto
        </FormLabel>
      )}
    </div>
  )
}
