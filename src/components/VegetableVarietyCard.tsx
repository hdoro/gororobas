'use client'

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { VegetableVarietyCardData } from '@/queries'
import { cn } from '@/utils/cn'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { useCallback, useEffect, useState } from 'react'
import PhotoLabelAndSources from './PhotoLabelAndSources'
import { SanityImage } from './SanityImage'
import { Text } from './ui/text'

export default function VegetableVarietyCard({
  variety,
}: {
  variety: VegetableVarietyCardData
}) {
  if (!variety.names || variety.names.length === 0) return null

  return (
    <div className="flex-[1_0_min(25rem,95vw)] @container">
      <div className="flex flex-col gap-5 @sm:flex-row @sm:items-center">
        {variety.photos.length > 0 ? (
          <CardWithPhotoContents variety={variety} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-200">
            <span>{variety.names[0]}</span>
          </div>
        )}
        <div
          className="max-w-xs"
          style={{
            minWidth: `${variety.names[0].length / 2}ch`,
          }}
        >
          <Text level="h3" weight="normal">
            {variety.names[0]}
          </Text>
          {variety.names.length > 1 && (
            <ul className="hide-scrollbar scrollbar-gradient relative max-h-28 space-y-1 overflow-y-auto">
              {[...variety.names, ...variety.names, ...variety.names]
                .slice(1)
                .map((name) => (
                  <li key={name} className="leading-tight">
                    {name}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function CardWithPhotoContents({
  variety,
}: {
  variety: VegetableVarietyCardData
}) {
  const { photos = [] } = variety
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
    <div className="relative aspect-[1.15] h-auto max-w-[15.625rem] overflow-hidden rounded-lg">
      {photos.length > 1 && (
        <>
          <Carousel
            className={'h-full w-full'}
            opts={{
              loop: true,
              duration: 15,
            }}
            plugins={[WheelGesturesPlugin()]}
            setApi={setApi}
          >
            <CarouselContent className="h-full" rootClassName="h-full">
              {photos.map((photo, idx) => {
                return (
                  <CarouselItem
                    key={photo.sanity_id || idx}
                    className="relative h-full w-full"
                  >
                    <PhotoLabelAndSources
                      photo={{ ...photo, label: '' }}
                      // Higher left value to compensate for carousel item's left padding
                      className="left-6"
                    />

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
        </>
      )}
      {photos.length === 1 && (
        <>
          <PhotoLabelAndSources photo={{ ...photos[0], label: '' }} />
          <SanityImage
            image={photos[0]}
            maxWidth={250}
            className={
              'block h-full w-full object-cover !transition-all group-hover:scale-105'
            }
            draggable={false}
          />
        </>
      )}
    </div>
  )
}
