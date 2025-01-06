'use client'

import ChangeIndicator from '@/components/ChangeIndicator'
import { useFullscreenPhotos } from '@/components/FullscreenPhotos'
import PhotoLabelAndSources from '@/components/PhotoLabelAndSources'
import { SanityImage } from '@/components/SanityImage'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { ImageForRenderingData } from '@/queries'
import { cn } from '@/utils/cn'
import type { VegetablePageHeroData } from './VegetablePageHero'

export function VegetableHeroPhotos({
  photos,
  diffKeys,
}: {
  photos: ImageForRenderingData[]
  diffKeys?: (keyof VegetablePageHeroData)[]
}) {
  const fullscreen = useFullscreenPhotos()
  const mainImage = photos?.[0]

  const carouselPhotos = (photos || []).flatMap((p) => (p.sanity_id ? p : []))

  if (!photos.length || !mainImage?.sanity_id) return null

  return (
    <div
      className={cn(
        'mt-5 flex flex-col gap-5 overflow-hidden lg:flex-row',
        diffKeys?.includes('photos') && 'relative overflow-visible',
      )}
    >
      {diffKeys?.includes('photos') && <ChangeIndicator />}
      {carouselPhotos.length > 1 && (
        <Carousel
          className={'max-h-[70dvh] flex-1 overflow-hidden lg:max-h-[50dvh]'}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent className="ml-0 space-x-5" rootClassName="">
            {carouselPhotos.map((photo, idx) => {
              return (
                <CarouselItem
                  key={photo.sanity_id || idx}
                  className={cn(
                    'relative flex justify-center overflow-hidden rounded-2xl bg-stone-200 pl-0',
                  )}
                >
                  <button
                    type="button"
                    onClickCapture={() => fullscreen.openAtIndex(idx)}
                  >
                    <SanityImage
                      image={photo}
                      maxWidth={520}
                      className={
                        'h-full max-h-[70dvh] w-auto object-contain object-center data-[loaded=false]:h-auto data-[loaded=false]:max-h-full lg:max-h-[50dvh]'
                      }
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </button>
                  <PhotoLabelAndSources photo={photo} />
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <div className="absolute bottom-4 right-2 flex items-center gap-2.5">
            <CarouselPrevious className="relative left-0 top-0 translate-x-0 translate-y-0 bg-white" />
            <CarouselNext className="relative left-0 top-0 translate-x-0 translate-y-0 bg-white" />
          </div>
        </Carousel>
      )}
    </div>
  )
}
