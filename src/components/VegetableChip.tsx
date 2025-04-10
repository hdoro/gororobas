'use client'

import Link from '@/components/LinkWithTransition'
import { SanityImage } from '@/components/SanityImage'
import SeedlingIcon from '@/components/icons/SeedlingIcon'
import { Text } from '@/components/ui/text'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { WishlistForProfile } from '@/queries'
import { paths } from '@/utils/urls'
import { type VariantProps, tv } from 'tailwind-variants'

const vegetableChipVariants = tv({
  slots: {
    root: 'ring-primary-300 relative flex-[0_0_max-content] rounded-full outline-hidden transition-transform z-20 focus-visible:ring-3',
    imageAndIcon: 'border-background rounded-full border-2',
    name: '',
  },
  variants: {
    size: {
      sm: {
        imageAndIcon: 'size-7',
        icon: 'size-7',
        name: 'text-sm md:text-sm',
      },
      md: {
        imageAndIcon: 'size-10',
        name: 'text-lg md:text-lg',
      },
    },
    includeName: {
      true: {
        root: 'inline-flex items-center gap-1',
      },
      false: {
        root: 'inline-block group/vegetable-chip',
        imageAndIcon:
          'transition-transform group-hover/vegetable-chip:scale-110 group-focus-visible/vegetable-chip:scale-110',
        icon: 'group-hover/vegetable-chip:scale-110 group-focus-visible/vegetable-chip:scale-110',
      },
    },
  },
  defaultVariants: {
    size: 'md',
    includeName: false,
  },
})

export default function VegetableBadge({
  vegetable,
  ...variants
}: {
  vegetable: WishlistForProfile['vegetable']
} & VariantProps<typeof vegetableChipVariants>) {
  const classes = vegetableChipVariants(variants)

  const Chip = (
    <Link href={paths.vegetable(vegetable.handle)} className={classes.root()}>
      {vegetable.photos[0] ? (
        <SanityImage
          image={vegetable.photos[0]}
          maxWidth={40}
          className={classes.imageAndIcon({ className: 'block object-cover' })}
        />
      ) : (
        <div
          className={classes.imageAndIcon({
            className:
              'flex items-center justify-center overflow-hidden bg-stone-200',
          })}
        >
          <SeedlingIcon
            variant="monochrome"
            className="text-primary-700 size-[40%]"
          />
        </div>
      )}
      {variants.includeName && (
        <Text className={classes.name()}>{vegetable.name}</Text>
      )}
    </Link>
  )

  // No need for the tooltip if including the name
  if (variants.includeName) {
    return Chip
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{Chip}</TooltipTrigger>
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
