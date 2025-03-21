import { generateId } from '@/utils/ids'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  type UniqueIdentifier,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon, PlusCircleIcon, TrashIcon } from 'lucide-react'
import type { JSX, PropsWithChildren } from 'react'
import {
  type ControllerRenderProps,
  type FieldArray,
  type FieldPath,
  type FieldValues,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

export default function ArrayInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  newItemLabel = 'Novo item',
  newItemValue,
  renderItem,
  inputType = 'regular',
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  newItemLabel?: string
  newItemValue?: FieldArray<FieldValues, TName>
  renderItem: (index: number) => JSX.Element
  inputType?: 'regular' | 'dialog'
}) {
  const { control } = useFormContext()
  const fieldArray = useFieldArray({
    control,
    name: field.name,
    keyName: 'id',
  })
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fieldArray.fields}
          strategy={verticalListSortingStrategy}
        >
          {fieldArray.fields.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              index={index}
              removeItem={() => fieldArray.remove(index)}
            >
              {renderItem(index)}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <div className="mt-4! flex items-center gap-2">
        <Separator className="w-auto flex-1" />
        <Button
          onClick={() => {
            fieldArray.append(
              {
                id: generateId(),
                ...(newItemValue || {}),
              } as FieldArray<FieldValues, TName>,
              {
                shouldFocus: inputType === 'regular',
              },
            )

            // Manually open the dialog after creation
            if (inputType === 'dialog') {
              requestAnimationFrame(() => {
                const newItemIndex = fieldArray.fields.length
                const newItemElement = document.querySelector(
                  `*[data-array-item-field-name="${field.name}.${newItemIndex}"]`,
                )
                if (newItemElement && newItemElement instanceof HTMLElement) {
                  newItemElement.scrollIntoView?.({ behavior: 'smooth' })
                  newItemElement.focus?.()
                  if (
                    newItemElement.getAttribute('aria-haspopup') === 'dialog'
                  ) {
                    newItemElement.click?.()
                  }
                }
              })
            }
          }}
          mode="bleed"
          size="sm"
          disabled={field.disabled}
        >
          <PlusCircleIcon className="mr-2" /> {newItemLabel}
        </Button>
        <Separator className="w-auto flex-1" />
      </div>
    </div>
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fieldArray.fields.findIndex(
        (item) => item.id === active.id,
      )
      const newIndex = fieldArray.fields.findIndex(
        (item) => item.id === over.id,
      )
      fieldArray.move(oldIndex, newIndex)
    }
  }
}

export function SortableItem(
  props: PropsWithChildren<{
    id: UniqueIdentifier
    removeItem: () => void
    index: number
    disabled?: boolean
  }>,
) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-1">
      <Button
        mode="bleed"
        size="icon"
        title="Segure para mover"
        tone="neutral"
        disabled={props.disabled}
        {...attributes}
        {...listeners}
        className="group h-10 w-8"
      >
        <GripVerticalIcon className="stroke-muted-foreground group-hover:stroke-foreground size-5" />
      </Button>
      <div className="flex-1">{props.children}</div>
      <Button
        mode="bleed"
        tone="destructive"
        size="icon"
        title={`Deletar item #${props.index + 1}`}
        onClick={props.removeItem}
        disabled={props.disabled}
        className="group h-10 w-8"
      >
        <TrashIcon className="stroke-muted-foreground size-5 group-hover:stroke-current" />
      </Button>
    </div>
  )
}
