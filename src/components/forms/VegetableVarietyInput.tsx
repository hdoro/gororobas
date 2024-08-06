import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { VegetableVarietyInForm } from '@/schemas'
import { cn } from '@/utils/cn'
import { truncate } from '@/utils/strings'
import { ImageOffIcon } from 'lucide-react'
import {
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from 'react-hook-form'
import { SanityImage } from '../SanityImage'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import ArrayInput from './ArrayInput'
import Field from './Field'
import ImageInput from './ImageInput'

export default function VegetableVarietyInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field: rootField,
  index: varietyIndex,
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  index: number
}) {
  const form = useFormContext()
  const freshValue = form.watch(rootField.name)
  const value = (freshValue || {}) as Partial<VegetableVarietyInForm>
  const { names = [] } = value

  const renderablePhoto = value.photos?.[0]
  return (
    <Dialog>
      <DialogTrigger
        className="block h-full w-full rounded-md border bg-background p-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        data-array-item-field-name={rootField.name}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'h-[6.25rem] w-[6.25rem] flex-[0_0_6.25rem] overflow-hidden rounded-lg bg-card-foreground/5 text-primary-700',
              renderablePhoto ? '' : 'flex items-center justify-center',
            )}
          >
            {renderablePhoto &&
            'file' in renderablePhoto &&
            renderablePhoto.file instanceof File ? (
              <img
                src={URL.createObjectURL(renderablePhoto.file)}
                alt={renderablePhoto.label || ''}
                className="h-full w-full object-contain"
              />
            ) : renderablePhoto && 'sanity_id' in renderablePhoto ? (
              <SanityImage
                image={renderablePhoto}
                maxWidth={150}
                alt={renderablePhoto.label || ''}
                className="h-full w-full object-contain"
              />
            ) : (
              <ImageOffIcon />
            )}
          </div>
          <div className="space-y-1 text-left">
            <h2 className={names[0]?.value ? '' : 'text-primary-700'}>
              {names[0]?.value || 'Variedade sem nome'}
            </h2>
            {names.length > 1 && (
              <p className="text-xs">
                {truncate(
                  names
                    .slice(1)
                    .map((n) => n.value.trim())
                    .join(', '),
                  100,
                )}
              </p>
            )}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent hasClose={false}>
        <DialogHeader>
          <DialogTitle>
            Editar variedade{' '}
            {typeof varietyIndex === 'number' && `#${varietyIndex + 1}`}
          </DialogTitle>
          <DialogClose asChild>
            <Button mode="outline" tone="neutral" size="sm">
              Fechar
            </Button>
          </DialogClose>
        </DialogHeader>
        <DialogBody className="space-y-6">
          <Field
            label="Nomes"
            name={`${rootField.name}.names`}
            form={form}
            render={({ field: namesField }) => (
              <ArrayInput
                field={namesField}
                // @ts-expect-error no way for TS to know the type of `newItemValue`
                newItemValue={{ value: '' }}
                newItemLabel="Novo nome"
                renderItem={(index) => (
                  <Field
                    form={form}
                    name={`${namesField.name}.${index}.value`}
                    label={`Nome ${index + 1}`}
                    hideLabel
                    render={({ field: subField }) => <Input {...subField} />}
                  />
                )}
              />
            )}
          />
          <Field
            form={form}
            name={`${rootField.name}.photos`}
            label="Fotos"
            render={({ field: photosField }) => {
              return (
                <ArrayInput
                  field={photosField}
                  newItemLabel="Nova foto"
                  renderItem={(index) => (
                    <Field
                      form={form}
                      name={`${photosField.name}.${index}`}
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
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
