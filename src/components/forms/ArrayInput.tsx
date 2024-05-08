import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon, PlusCircleIcon, TrashIcon } from 'lucide-react'
import { type PropsWithChildren } from 'react'
import {
  useFieldArray,
  useFormContext,
  type ControllerRenderProps,
  type FieldArray,
  type FieldPath,
  type FieldValues,
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
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  newItemLabel?: string
  newItemValue: FieldArray<FieldValues, TName>
  renderItem: (index: number) => JSX.Element
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
      <div className="flex gap-2 items-center !mt-4">
        <Separator className="w-auto flex-1" />
        <Button
          onClick={() => {
            fieldArray.append(newItemValue)
          }}
          type="button"
          variant="ghost"
          size="sm"
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
  }>,
) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-4">
      <Button
        variant="ghost"
        size="icon"
        title="Segure para mover"
        type="button"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon />
      </Button>
      <div className="flex-1">{props.children}</div>
      <Button
        variant="ghost"
        size="icon"
        title={`Deletar item #${props.index + 1}`}
        onClick={props.removeItem}
        type="button"
        className="text-gray-500 hover:text-red-700 focus-visible:text-red-700 dark:text-gray-100 dark:hover:text-red-500 dark:focus-visible:text-red-500"
      >
        <TrashIcon className="stroke-current" />
      </Button>
    </div>
  )
}
