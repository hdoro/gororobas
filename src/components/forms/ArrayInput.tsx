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
import type { DeepKeys, FieldApi } from '@tanstack/react-form'
import { GripVerticalIcon, TrashIcon } from 'lucide-react'
import { type PropsWithChildren } from 'react'
import { Button } from '../ui/button'

export default function ArrayInput<
  ItemType extends { id: UniqueIdentifier },
  FormValue extends Record<string, any>,
  FieldName extends DeepKeys<FormValue>,
>({
  field,
  newItemValue,
  renderItem,
}: {
  field: FieldApi<FormValue, FieldName>
  newItemValue: Omit<ItemType, 'id'>
  renderItem: (index: number) => JSX.Element
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const value = (field.state.value as Array<ItemType>) || []

  return (
    <div className="space-y-3">
      <pre>{JSON.stringify(value, null, 2)}</pre>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={value} strategy={verticalListSortingStrategy}>
          {value.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              index={index}
              removeItem={() => field.removeValue(index)}
            >
              {renderItem(index)}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <Button
        onClick={() => {
          field.pushValue({
            ...newItemValue,
            id: Math.random().toString().split('.')[1],
          } as any)
        }}
        type="button"
      >
        Novo item
      </Button>
    </div>
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((item) => item.id === active.id)
      const newIndex = value.findIndex((item) => item.id === over.id)
      console.log({ oldIndex, newIndex, over, active })
      field.moveValue(oldIndex, newIndex)
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
    <div ref={setNodeRef} style={style} className="flex items-end gap-4">
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
