'use client'

import { SanityImage } from '@/components/SanityImage'
import SeedlingIcon from '@/components/icons/SeedlingIcon'
import { Text } from '@/components/ui/text'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { WishlistForProfile } from '@/queries'
import { paths } from '@/utils/urls'
import Link from 'next/link'
import type { JSX, SVGProps } from 'react'

function VegetableBadge({
  vegetable,
}: {
  vegetable: WishlistForProfile['vegetable']
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={paths.vegetable(vegetable.handle)}
          className="group ring-primary-300 relative inline-block size-10 flex-[0_0_2.5rem] rounded-full outline-hidden transition-transform hover:z-10 focus-visible:z-10 focus-visible:ring-3"
        >
          {vegetable.photos[0] ? (
            <SanityImage
              image={vegetable.photos[0]}
              maxWidth={40}
              className="border-background block size-10 rounded-full border-2 object-cover transition-transform group-hover:scale-110 group-focus-visible:scale-110"
            />
          ) : (
            <div className="border-background flex size-10 items-center justify-center overflow-hidden rounded-full border-2 bg-stone-200 transition-transform group-hover:scale-110 group-focus-visible:scale-110">
              <SeedlingIcon variant="monochrome" className="size-4" />
            </div>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent
        className="bg-card border"
        side="bottom"
        sideOffset={8}
        align="start"
      >
        <Text level="sm" className="max-w-[20rem]">
          {vegetable.name}
        </Text>
      </TooltipContent>
    </Tooltip>
  )
}

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
