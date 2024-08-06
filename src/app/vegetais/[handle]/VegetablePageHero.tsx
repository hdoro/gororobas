import ChangeIndicator from '@/components/ChangeIndicator'
import PhotoLabelAndSources from '@/components/PhotoLabelAndSources'
import { SanityImage } from '@/components/SanityImage'
import { Badge } from '@/components/ui/badge'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Text } from '@/components/ui/text'
import type { VegetablePageData } from '@/queries'
import { cn } from '@/utils/cn'
import { getImageDimensions } from '@/utils/getImageProps'
import {
  EDIBLE_PART_TO_LABEL,
  PLANTING_METHOD_TO_LABEL,
  STRATUM_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { average, formatCentimeters } from '@/utils/numbers'
import { gender } from '@/utils/strings'
import { Fragment, Suspense } from 'react'
import WishlistButtonData from './WishlistButtonData'

export type VegetablePageHeroData = Omit<
  VegetablePageData,
  'related_notes' | 'sources' | 'friends' | 'tips'
>

export function VegetablePageHero({
  vegetable,
  diffKeys,
}: {
  vegetable: VegetablePageHeroData
  /** In the context of EditSuggestions, this is an array of keys that changed in the hero */
  diffKeys?: (keyof VegetablePageHeroData)[]
}) {
  const mainImage = vegetable.photos?.[0]
  const { names = [], scientific_names = [] } = vegetable

  const mainImageAspectRatio =
    mainImage && getImageDimensions(mainImage)?.aspectRatio
  const carouselPhotos = [
    ...(vegetable.photos || []).slice(1),
    ...(vegetable.varieties || []).flatMap((v) => v.photos || []),
  ].flatMap((p) => (p.sanity_id ? p : []))

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

  return (
    <div className="max-w-[53.125rem] flex-[5]">
      <div className="flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between md:gap-5">
        <div>
          <Text level="h1" as="h1">
            {names[0]}
          </Text>
          {scientific_names?.[0] && (
            <Text level="h2" weight="normal" className="italic">
              {scientific_names[0]}
            </Text>
          )}
        </div>
        {/* Hide the wishlist action when reviewing a suggestion */}
        {!diffKeys && (
          <Suspense>
            <WishlistButtonData vegetable_id={vegetable.id} />
          </Suspense>
        )}
      </div>

      {vegetable.photos && mainImage?.sanity_id && (
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
          <div className="relative z-10 max-h-[80dvh] flex-1 rounded-2xl object-cover lg:max-h-[var(--max-height)] lg:max-w-80">
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
          </div>
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
                      <SanityImage
                        image={photo}
                        maxWidth={520}
                        className={
                          'h-full max-h-[80dvh] w-auto object-contain object-center lg:max-h-[var(--max-height)]'
                        }
                      />
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
      )}

      <div className="mt-10 space-y-8">
        {names.length > 1 && (
          <TwoColInfo
            left={`Também conhecid${gender.suffix(
              vegetable.gender || 'MASCULINO',
            )} como`}
            right={names.slice(1).join(', ')}
            hasChanged={diffKeys?.includes('names')}
          />
        )}
        {vegetable.scientific_names &&
          vegetable.scientific_names.length > 1 && (
            <TwoColInfo
              left={'Nomes científicos'}
              right={vegetable.scientific_names.join(', ')}
              hasChanged={diffKeys?.includes('scientific_names')}
            />
          )}
        {vegetable.origin && (
          <TwoColInfo
            left={'Origem'}
            right={vegetable.origin}
            hasChanged={diffKeys?.includes('origin')}
          />
        )}
        {vegetable.uses && (
          <TwoColInfo
            left={'Principais usos'}
            right={vegetable.uses.map((u) => USAGE_TO_LABEL[u])}
            hasChanged={diffKeys?.includes('uses')}
          />
        )}
        {vegetable.edible_parts && (
          <TwoColInfo
            left={'Partes comestíveis'}
            right={vegetable.edible_parts.map((u) => EDIBLE_PART_TO_LABEL[u])}
            hasChanged={diffKeys?.includes('edible_parts')}
          />
        )}
        {vegetable.strata && (
          <TwoColInfo
            left={'Estrato'}
            right={vegetable.strata.map((u) => STRATUM_TO_LABEL[u])}
            hasChanged={diffKeys?.includes('strata')}
          />
        )}
        {vegetable.lifecycles && (
          <TwoColInfo
            left={'Ciclo de vida'}
            right={vegetable.lifecycles.map(
              (u) => VEGETABLE_LIFECYCLE_TO_LABEL[u],
            )}
            hasChanged={diffKeys?.includes('lifecycles')}
          />
        )}
        {vegetable.planting_methods && (
          <TwoColInfo
            left={'Métodos de plantio e propagação'}
            right={vegetable.planting_methods.map(
              (u) => PLANTING_METHOD_TO_LABEL[u],
            )}
            hasChanged={diffKeys?.includes('planting_methods')}
          />
        )}
        {(vegetable.temperature_min || vegetable.temperature_max) && (
          <TwoColInfo
            left={'Temperatura ideal'}
            right={
              vegetable.temperature_min && vegetable.temperature_max
                ? `De ${vegetable.temperature_min}° a ${vegetable.temperature_max}°C`
                : vegetable.temperature_min
                  ? `Acima de ${vegetable.temperature_min}°C`
                  : `Abaixo de ${vegetable.temperature_max}°C`
            }
            hasChanged={
              diffKeys?.includes('temperature_min') ||
              diffKeys?.includes('temperature_max')
            }
          />
        )}
        {(vegetable.height_min || vegetable.height_max) && (
          <TwoColInfo
            left={`Altura quando adult${gender.suffix(vegetable.gender || 'FEMININO')}`}
            right={
              vegetable.height_min && vegetable.height_max
                ? `De ${formatCentimeters(vegetable.height_min)} a ${formatCentimeters(vegetable.height_max)}`
                : vegetable.height_min
                  ? `A partir de ${formatCentimeters(vegetable.height_min)}`
                  : `Até ${formatCentimeters(vegetable.height_max || 0)}`
            }
            hasChanged={
              diffKeys?.includes('height_min') ||
              diffKeys?.includes('height_max')
            }
          />
        )}
        {(vegetable.development_cycle_min ||
          vegetable.development_cycle_max) && (
          <TwoColInfo
            left={'Ciclo de desenvolvimento (referência)'}
            right={
              vegetable.development_cycle_min && vegetable.development_cycle_max
                ? `De ${vegetable.development_cycle_min} a ${vegetable.development_cycle_max} dias`
                : vegetable.development_cycle_min
                  ? `A partir de ${vegetable.development_cycle_min} dias`
                  : `Até ${vegetable.development_cycle_max} dias`
            }
            hasChanged={
              diffKeys?.includes('development_cycle_min') ||
              diffKeys?.includes('development_cycle_max')
            }
          />
        )}
      </div>
    </div>
  )
}

function TwoColInfo({
  left,
  right,
  hasChanged = false,
}: {
  left: string
  right: string | string[]
  hasChanged?: boolean | undefined
}) {
  if (!right || (Array.isArray(right) && right.length === 0)) return null

  return (
    <div className="relative flex items-start gap-5 leading-normal">
      {hasChanged && <ChangeIndicator />}
      <Text as="h2" weight="semibold" className="max-w-[12.5rem] flex-1">
        {left}
      </Text>
      <Text
        className={cn(
          'wrap flex flex-1 gap-2',
          Array.isArray(right) && '-ml-1',
        )}
        as={Array.isArray(right) ? 'div' : 'p'}
      >
        {Array.isArray(right) &&
          right.map((item, i) => {
            if (!item) return null
            return (
              // biome-ignore lint: we need to use the index to account for empty paragraphs
              <Badge key={item + i}>{item}</Badge>
            )
          })}
        {typeof right === 'string' && (
          <>
            {right.split('\n').map((paragraph, idx, arr) => (
              // biome-ignore lint: we need to use the index to account for empty paragraphs
              <Fragment key={paragraph + idx}>
                {paragraph}
                {idx < arr.length - 1 && <br />}
              </Fragment>
            ))}
          </>
        )}
      </Text>
    </div>
  )
}
