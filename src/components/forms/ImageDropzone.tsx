'use client'

import { m } from '@/paraglide/messages'
import { cn } from '@/utils/cn'
import { generateId } from '@/utils/ids'
import { CircleXIcon, UploadCloudIcon } from 'lucide-react'
import type React from 'react'
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
  rootField,
  value,
  clearValue,
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  rootField: ControllerRenderProps<any, any>
  value: File | null | undefined
  clearValue: (e: React.MouseEvent) => void
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
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    maxSize: MAX_UPLOAD_SIZE,
    onDropRejected: (fileRejections) => {
      const fileRejection = fileRejections[0]
      if (fileRejection.errors[0].code === 'file-invalid-type') {
        toast({
          title: m.major_hour_okapi_hope(),
          description: m.fancy_actual_albatross_gaze(),
          variant: 'destructive',
        })
      } else if (fileRejection.errors[0].code === 'file-too-large') {
        toast({
          title: m.novel_fluffy_orangutan_love(),
          description: m.muddy_these_crab_lend(),
          variant: 'destructive',
        })
      }
    },
    onDropAccepted: (files) => {
      // initialize the ID when there's no value
      if (!value) {
        rootField.onChange({ id: generateId(), ...(rootField.value || {}) })
      }
      field.onChange(files[0])
      field.onBlur()
    },
  })

  function clearField(e: React.MouseEvent) {
    clearValue(e)
    rootRef.current?.focus()
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'image-dropzone border-border bg-card relative flex aspect-square w-[12.5rem] flex-[0_0_max-content] items-center justify-center rounded-lg border-2',
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
              alt={m.direct_pink_rook_tickle()}
              className="block h-full w-full object-contain"
            />
          )}
          {!field.disabled && (
            <Button
              onClick={clearField}
              className="absolute top-2 right-2 rounded-full"
              aria-label={m.helpful_house_carp_promise()}
              tone="destructive"
              mode="outline"
              size="icon"
            >
              <CircleXIcon className="stroke-current" />
            </Button>
          )}
        </>
      ) : (
        <FormLabel>
          <div className="flex flex-col items-center justify-center gap-1 p-4 text-center text-xs font-normal">
            <UploadCloudIcon className="opacity-80" />
            {m.ornate_such_weasel_reap()}
          </div>
        </FormLabel>
      )}
    </div>
  )
}
