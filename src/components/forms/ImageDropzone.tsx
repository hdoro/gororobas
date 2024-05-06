import { UploadCloudIcon } from 'lucide-react'
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFormContext } from 'react-hook-form'
import Field from './Field'

function convertFileToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    // Event handler executed after the file has been read
    reader.onload = () => {
      // The result attribute contains the resulting base64 string
      resolve(reader.result)
    }

    // Event handler executed if there is an error reading the file
    reader.onerror = (error) => {
      reject(error)
    }

    // Start reading the file as a Data URL
    reader.readAsDataURL(file)
  })
}

export default function ImageDropzone(props: { fieldName: string }) {
  const form = useFormContext()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      convertFileToBase64(file).then((base64) => {
        form.setValue(props.fieldName, base64, {
          shouldValidate: false,
        })
      })
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.avif', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  })

  return (
    <div
      {...getRootProps()}
      className={
        'aspect-square bg-gray-200 w-[12.5rem] flex-[0_0_max-content] flex items-center justify-center rounded-lg'
      }
    >
      <Field
        form={form}
        label="Imagem"
        name={props.fieldName}
        render={({ field }) => <input {...field} {...getInputProps()} />}
      />
      <div className="flex flex-col items-center justify-center gap-1 text-xs text-center p-4">
        <UploadCloudIcon />
        Clique aqui ou arraste a foto
      </div>
    </div>
  )
}
