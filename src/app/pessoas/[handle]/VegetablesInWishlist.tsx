'use client'

import VegetableBadge from '@/components/VegetableChip'
import { Text } from '@/components/ui/text'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { WishlistForProfile } from '@/queries'
import type { JSX, SVGProps } from 'react'

export function VegetablesInWishlist(props: {
  title: string
  list: WishlistForProfile[]
  count: number
  Icon?: (
    props: SVGProps<SVGSVGElement> & {
      variant: 'color' | 'monochrome'
    },
  ) => JSX.Element
}) {
  return (
    <div className="space-y-1">
      <Text weight="semibold" className="flex items-start gap-2">
        {props.Icon && <props.Icon variant="color" className="size-6" />}
        {props.title}
      </Text>
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center -space-x-3">
          {props.list.map(({ vegetable }) => (
            <VegetableBadge key={vegetable.handle} vegetable={vegetable} />
          ))}
          {props.count > props.list.length && (
            <Text
              level="sm"
              className="text-muted-foreground inline-block pl-4"
            >
              e {props.count - props.list.length} outros
            </Text>
          )}
        </div>
      </TooltipProvider>
    </div>
  )
}
