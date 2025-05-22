'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { m } from '@/paraglide/messages'
import { cn } from '@/utils/cn'
import { isToday } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form'
import { FormControl } from '../ui/form'
import type { FieldClassnames } from './Field'

export const DATE_FIELD_CLASSNAMES: FieldClassnames = {
  root: 'flex items-center gap-2 space-y-0',
  label: 'order-1', // put the label after the switch
}

export default function DateInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  field,
  timeWindow = 'any',
}: {
  field: ControllerRenderProps<TFieldValues, TName>
  timeWindow?: 'any' | 'past' | 'future'
}) {
  const date = new Date(field.value)
  return (
    <FormControl>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            mode="bleed"
            tone="neutral"
            className={cn(!date && 'text-muted-foreground')}
            size="sm"
            disabled={field.disabled}
          >
            <CalendarIcon className="h-auto w-[1.25em]" />
            {date ? (
              isToday(date) ? (
                m.drab_late_snail_gaze()
              ) : (
                date.toLocaleDateString('pt-BR', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                })
              )
            ) : (
              <span>{m.active_formal_wallaby_snip()}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => field.onChange(date?.toISOString())}
            disabled={
              timeWindow === 'past'
                ? (date) => date >= new Date()
                : timeWindow === 'future'
                  ? (date) => date <= new Date()
                  : undefined
            }
          />
        </PopoverContent>
      </Popover>
    </FormControl>
  )
}
