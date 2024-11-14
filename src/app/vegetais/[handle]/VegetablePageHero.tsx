import ChangeIndicator from '@/components/ChangeIndicator'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { VegetablePageData } from '@/queries'
import { cn } from '@/utils/cn'
import {
  EDIBLE_PART_TO_LABEL,
  PLANTING_METHOD_TO_LABEL,
  STRATUM_EXPLAINERS,
  STRATUM_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_LIFECYCLE_EXPLAINERS,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { formatCentimeters } from '@/utils/numbers'
import { gender } from '@/utils/strings'
import { paths } from '@/utils/urls'
import { CircleHelp, Edit2Icon, InfoIcon } from 'lucide-react'
import Link from 'next/link'
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

      <div className="mt-6 space-y-8">
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
            leftDescription="Camada vertical conforme necessidade de luz"
            right={vegetable.strata.map((u) => ({
              label: STRATUM_TO_LABEL[u],
              explainer: STRATUM_EXPLAINERS[u],
            }))}
            hasChanged={diffKeys?.includes('strata')}
          />
        )}
        {vegetable.lifecycles && (
          <TwoColInfo
            left={'Ciclo de vida'}
            leftDescription="Duração do o plantio até a morte ou colheita"
            right={vegetable.lifecycles.map((u) => ({
              label: VEGETABLE_LIFECYCLE_TO_LABEL[u],
              explainer: VEGETABLE_LIFECYCLE_EXPLAINERS[u],
            }))}
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
            leftDescription="Quanto tempo até começarmos a colher"
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

      <div className="mt-10 border-2 bg-card px-4 py-3 rounded-lg flex items-start gap-2 text-stone-800">
        <InfoIcon className="w-6 h-6 flex-[0_0_1.5rem] opacity-80 mt-1" />
        <div className="space-y-1">
          <Text level="h3" weight="semibold">
            Alguma informação errada ou faltando?
          </Text>
          <Text level="sm">
            Você pode{' '}
            <Link
              href={paths.editVegetable(vegetable.handle)}
              className="underline font-semibold"
            >
              <Edit2Icon className="w-4 h-4 inline-block" /> enviar uma sugestão
            </Link>
            , essa enciclopédia é colaborativa!
          </Text>
        </div>
      </div>
    </div>
  )
}

function TwoColInfo({
  left,
  leftDescription,
  right,
  hasChanged = false,
}: {
  left: string
  leftDescription?: string
  right: string | (string | { label: string; explainer?: string })[]
  hasChanged?: boolean | undefined
}) {
  if (!right || (Array.isArray(right) && right.length === 0)) return null

  return (
    <div className="relative flex items-start gap-5 leading-normal max-w-full">
      {hasChanged && <ChangeIndicator />}
      <div className="w-[min(40%,12.5rem)] flex-[0_0_min(40%,12.5rem)]">
        <Text as="h2" weight="semibold">
          {left}
        </Text>
        {leftDescription && (
          <Text as="p" level="sm">
            {leftDescription}
          </Text>
        )}
      </div>
      <Text
        className={cn(
          'wrap flex flex-1 gap-2 overflow-auto hide-scrollbar lg:mr-0 lg:pr-0 -mr-[calc(var(--page-padding-x)_*_2)] pr-[calc(var(--page-padding-x)_*_2)]',
          Array.isArray(right) && '-ml-1',
        )}
        as={Array.isArray(right) ? 'div' : 'p'}
      >
        {Array.isArray(right) &&
          right.map((item) => {
            if (!item) return null

            if (typeof item === 'string') {
              return (
                // biome-ignore lint: we need to use the index to account for empty paragraphs
                <Badge key={item}>{item}</Badge>
              )
            }

            return (
              <TooltipProvider key={item.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="select-none">
                      {item.label}{' '}
                      <CircleHelp className="w-4 h-4 ml-1 opacity-80" />
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card border">
                    <Text level="sm" className="max-w-[20rem]">
                      {item.explainer}
                    </Text>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        {typeof right === 'string' && (
          <>
            {right.split('\n').map((paragraph, idx, arr) => (
              // biome-ignore lint: we need to use the index to account for empty paragraphs
              <Fragment key={paragraph}>
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
