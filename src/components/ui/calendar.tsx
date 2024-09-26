'use client'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { pt } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type * as React from 'react'
import { DayPicker } from 'react-day-picker'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      locale={pt}
      classNames={{
        caption_label: 'text-sm font-medium',
        day_button: cn(
          buttonVariants({ mode: 'bleed' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        ),
        hidden: 'invisible',
        outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        range_end: 'day-range-end',
        range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        selected: buttonVariants({
          mode: 'default',
          className: 'p-0 *:text-primary-50',
        }),
        today: buttonVariants({
          mode: 'outline',
          className: 'p-0 *:text-stone-800',
          tone: 'neutral',
        }),
        day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        disabled: 'text-muted-foreground opacity-50',
        weekday:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        weekdays: 'flex',
        month_caption: 'flex justify-center pt-1 relative items-center',
        month: 'space-y-4',
        button_next: cn(
          buttonVariants({ mode: 'bleed' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        button_previous: cn(
          buttonVariants({ mode: 'bleed' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        nav: 'absolute top-0 p-3 inset-x-0 flex justify-between z-10',
        week: 'flex w-full mt-2',
        month_grid: 'w-full border-collapse space-y-1',
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === 'left') {
            return <ChevronLeft {...props} className="h-4 w-4" />
          }

          return <ChevronRight {...props} className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
