import ChangeIndicator from '@/components/ChangeIndicator'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import type { VegetablePageData } from '@/queries'
import { cn } from '@/utils/cn'
import {
  EDIBLE_PART_TO_LABEL,
  PLANTING_METHOD_TO_LABEL,
  STRATUM_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { formatCentimeters } from '@/utils/numbers'
import { gender } from '@/utils/strings'
import { Fragment, Suspense } from 'react'
import { VegetableHeroPhotos } from './VegetableHeroPhotos'
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
  const { names = [], scientific_names = [] } = vegetable

  const allPhotos = [
    ...(vegetable.photos || []),
    ...(vegetable.varieties || []).flatMap((v) => v.photos || []),
  ].flatMap((p) => (p.sanity_id ? p : []))

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

      <VegetableHeroPhotos photos={allPhotos} />

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
