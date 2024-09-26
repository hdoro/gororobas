'use client'

import { Badge } from '@/components/ui/badge'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { ImageForRenderingData, VegetableCardData } from '@/queries'
import { cn } from '@/utils/cn'
import { paths } from '@/utils/urls'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { SanityImage } from './SanityImage'

export default function VegetableCard({
  vegetable,
  fixedWidth = false,
}: {
  vegetable: VegetableCardData
  fixedWidth?: boolean
}) {
  const { photos: mainPhotos = [], varieties = [] } = vegetable

  const photos = [
    ...mainPhotos,
    ...(varieties?.flatMap((variety) => variety.photos) || []),
  ]

  return (
    <Link
      href={paths.vegetable(vegetable.handle)}
      className={cn(
        'group relative aspect-[1.15] h-auto overflow-hidden rounded-lg',
        fixedWidth &&
          'w-[var(--vegetable-card-width)] flex-[0_0_var(--vegetable-card-width)]',
      )}
      draggable={false}
    >
      {photos.length > 0 ? (
        <CardWithPhotoContents vegetable={vegetable} photos={photos} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-stone-200">
          <span>{vegetable.name}</span>
        </div>
      )}
    </Link>
  )
}

function CardWithPhotoContents({
  vegetable,
  photos,
}: {
  vegetable: VegetableCardData
  photos: ImageForRenderingData[]
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0)

  const onSelect = useCallback(() => {
    if (!api) return
    setSelectedSlideIndex(api.selectedScrollSnap())
  }, [api])

  useEffect(() => {
    if (!api) {
      return
    }
    onSelect()

    api.on('select', onSelect).on('reInit', onSelect)
  }, [api, onSelect])

  return (
    <>
      <Badge className="max-w-3/4 absolute left-2 top-2 z-20" variant="outline">
        {vegetable.name}
      </Badge>
      {photos.length > 1 && (
        <Carousel
          className={'h-full w-full'}
          opts={{
            loop: true,
            duration: 15,
          }}
          setApi={setApi}
          plugins={[WheelGesturesPlugin()]}
        >
          <CarouselContent className="h-full" rootClassName="h-full">
            {photos.map((photo, idx) => {
              return (
                <CarouselItem
                  key={photo.sanity_id || idx}
                  className="relative h-full w-full"
                >
                  <SanityImage
                    image={photo}
                    maxWidth={250}
                    className={
                      'block h-full w-full select-none object-cover !transition-all group-hover:scale-105'
                    }
                    draggable={false}
                  />
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <div
            className="absolute inset-x-0 bottom-0 z-20 flex justify-center gap-1.5 pb-2 pt-3"
            style={{
              background:
                'linear-gradient(180deg, rgba(64, 121, 75, 0) 0%, rgba(45, 78, 52) 105%)',
            }}
          >
            {photos.map((photo, index) => (
              <div
                key={photo.sanity_id}
                aria-hidden
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  index === selectedSlideIndex
                    ? 'bg-primary-50'
                    : 'bg-primary-200',
                )}
              />
            ))}
          </div>
          <CarouselPrevious className="absolute left-2 top-1/2 z-30 -translate-y-1/2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100" />
          <CarouselNext className="absolute right-2 top-1/2 z-30 -translate-y-1/2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100" />
        </Carousel>
      )}
      {photos.length === 1 && (
        <SanityImage
          image={photos[0]}
          maxWidth={250}
          className={
            'block h-full w-full object-cover !transition-all group-hover:scale-105'
          }
          draggable={false}
        />
      )}
    </>
  )
}
