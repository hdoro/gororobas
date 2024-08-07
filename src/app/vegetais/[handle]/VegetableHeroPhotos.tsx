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
import { getImageDimensions } from '@/utils/getImageProps'
import { average } from '@/utils/numbers'
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

  const mainImageAspectRatio =
    mainImage && getImageDimensions(mainImage)?.aspectRatio
  const carouselPhotos = (photos || [])
    .slice(1)
    .flatMap((p) => (p.sanity_id ? p : []))

  const aspectRatios = [mainImage, ...carouselPhotos].flatMap(
    (image) => (image && getImageDimensions(image)?.aspectRatio) || [],
  )
  const averageAspectRatio = average(aspectRatios)

  /** in pixels */
  const MAIN_IMAGE_WIDTH = 320
  // by forcing horizontal/square main image to grow a bit, we allow the carousel to be less horizontally stretched
  const MAIN_IMAGE_SIZE_INCREASE =
    mainImageAspectRatio && mainImageAspectRatio > 1 ? 1.3 : 1
  const maxImageHeight =
    Math.round(MAIN_IMAGE_WIDTH / averageAspectRatio) * MAIN_IMAGE_SIZE_INCREASE

  if (!photos.length || !mainImage?.sanity_id) return null

  return (
    <div
      className={cn(
        'mt-5 flex flex-col gap-5 overflow-hidden lg:flex-row',
        diffKeys?.includes('photos') && 'relative overflow-visible',
      )}
      style={{
        '--max-height': `${maxImageHeight / 16}rem`,
      }}
    >
      {diffKeys?.includes('photos') && <ChangeIndicator />}
      <button
        type="button"
        className="relative z-10 max-h-[80dvh] flex-1 rounded-2xl object-cover lg:max-h-[var(--max-height)] lg:max-w-80"
        onClick={() => fullscreen.openAtIndex(0)}
      >
        <SanityImage
          image={mainImage}
          maxWidth={320}
          className="relative z-10 h-full max-h-[inherit] w-full rounded-2xl object-cover"
          fetchPriority="high"
          loading="eager"
        />
        {/* Hides the left-most piece of the carousel images to fully show the main image's border */}
        <div
          aria-hidden
          className="absolute left-0 top-0 h-full w-6 bg-white"
        />
      </button>
      {carouselPhotos.length > 0 && (
        <Carousel
          className={'max-h-[80dvh] flex-1 lg:max-h-[var(--max-height)]'}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent className="ml-0 space-x-5" rootClassName="">
            {carouselPhotos.map((photo, idx) => {
              return (
                <CarouselItem
                  key={photo.sanity_id || idx}
                  className="relative flex justify-center overflow-hidden rounded-2xl bg-stone-200 pl-0"
                >
                  <button
                    type="button"
                    onClickCapture={() => fullscreen.openAtIndex(idx + 1)}
                  >
                    <SanityImage
                      image={photo}
                      maxWidth={520}
                      className={
                        'h-full max-h-[80dvh] w-auto object-contain object-center lg:max-h-[var(--max-height)]'
                      }
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
