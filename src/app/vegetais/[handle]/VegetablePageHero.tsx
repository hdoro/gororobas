import { CircleHelp, Edit2Icon, InfoIcon } from 'lucide-react'
import { Fragment, Suspense } from 'react'
import ChangeIndicator from '@/components/ChangeIndicator'
import Link from '@/components/LinkWithTransition'
import ReplaceI18nFragment from '@/components/ReplaceI18nFragments'
import { SanityImage } from '@/components/SanityImage'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { m } from '@/paraglide/messages'
import type { VegetablePageData } from '@/queries'
import { cn } from '@/utils/cn'
import {
  EDIBLE_PART_TO_LABEL,
  PLANTING_METHOD_EXPLAINERS,
  PLANTING_METHOD_TO_LABEL,
  STRATUM_EXPLAINERS,
  STRATUM_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_LIFECYCLE_EXPLAINERS,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { rangeValueToLabel } from '@/utils/numbers'
import { paths } from '@/utils/urls'
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

  const mainImage = allPhotos?.[0]

  return (
    <div className="max-w-[53.125rem] flex-5">
      <div className="flex flex-col items-start gap-3 md:flex-row md:items-end">
        {mainImage && (
          <SanityImage
            image={mainImage}
            maxWidth={64}
            className="size-16 rounded-sm object-cover"
            fetchPriority="high"
            loading="eager"
          />
        )}
        <div className="flex-1 -space-y-1">
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

      <TooltipProvider delayDuration={300}>
        <div className="mt-6 space-y-8">
          {names.length > 1 && (
            <TwoColInfo
              left={m.spare_good_boar_compose({
                gender: vegetable.gender || 'NEUTRO',
              })}
              right={names.slice(1).join(', ')}
              hasChanged={diffKeys?.includes('names')}
            />
          )}
          {vegetable.scientific_names &&
            vegetable.scientific_names.length > 1 && (
              <TwoColInfo
                left={m.late_dry_salmon_pinch()}
                right={vegetable.scientific_names.join(', ')}
                hasChanged={diffKeys?.includes('scientific_names')}
              />
            )}
          {vegetable.origin && (
            <TwoColInfo
              left={m.empty_acidic_alligator_renew()}
              right={vegetable.origin}
              hasChanged={diffKeys?.includes('origin')}
            />
          )}
          {vegetable.uses && (
            <TwoColInfo
              left={m.smug_misty_barbel_thrive()}
              right={vegetable.uses.map((u) => USAGE_TO_LABEL[u])}
              hasChanged={diffKeys?.includes('uses')}
            />
          )}
          {vegetable.edible_parts && (
            <TwoColInfo
              left={m.vegetable_field_edible_parts()}
              right={vegetable.edible_parts.map((u) => EDIBLE_PART_TO_LABEL[u])}
              hasChanged={diffKeys?.includes('edible_parts')}
            />
          )}
          {vegetable.strata && (
            <TwoColInfo
              left={m.tame_pink_toad_relish()}
              leftDescription={m.wise_bald_eel_treat()}
              right={vegetable.strata.map((u) => ({
                label: STRATUM_TO_LABEL[u],
                explainer: STRATUM_EXPLAINERS[u],
              }))}
              hasChanged={diffKeys?.includes('strata')}
            />
          )}
          {vegetable.lifecycles && (
            <TwoColInfo
              left={m.last_awful_mink_assure()}
              leftDescription={m.equal_big_piranha_zoom()}
              right={vegetable.lifecycles.map((u) => ({
                label: VEGETABLE_LIFECYCLE_TO_LABEL[u],
                explainer: VEGETABLE_LIFECYCLE_EXPLAINERS[u],
              }))}
              hasChanged={diffKeys?.includes('lifecycles')}
            />
          )}
          {vegetable.planting_methods && (
            <TwoColInfo
              left={m.loved_odd_leopard_dare()}
              right={vegetable.planting_methods.map((u) => ({
                label: PLANTING_METHOD_TO_LABEL[u],
                explainer: PLANTING_METHOD_EXPLAINERS[u],
              }))}
              hasChanged={diffKeys?.includes('planting_methods')}
            />
          )}
          {(vegetable.temperature_min || vegetable.temperature_max) && (
            <TwoColInfo
              left={m.away_elegant_earthworm_offer()}
              right={rangeValueToLabel(
                [vegetable.temperature_min, vegetable.temperature_max],
                'temperature',
              )}
              hasChanged={
                diffKeys?.includes('temperature_min') ||
                diffKeys?.includes('temperature_max')
              }
            />
          )}
          {(vegetable.height_min || vegetable.height_max) && (
            <TwoColInfo
              left={m.away_cuddly_elephant_twist({
                gender: vegetable.gender || 'NEUTRO',
              })}
              right={rangeValueToLabel(
                [vegetable.height_min, vegetable.height_max],
                'centimeters',
              )}
              hasChanged={
                diffKeys?.includes('height_min') ||
                diffKeys?.includes('height_max')
              }
            />
          )}
          {(vegetable.development_cycle_min ||
            vegetable.development_cycle_max) && (
            <TwoColInfo
              left={m.hour_born_dragonfly_favor()}
              leftDescription={m.less_top_meerkat_flip()}
              right={rangeValueToLabel(
                [
                  vegetable.development_cycle_min,
                  vegetable.development_cycle_max,
                ],
                'days',
              )}
              hasChanged={
                diffKeys?.includes('development_cycle_min') ||
                diffKeys?.includes('development_cycle_max')
              }
            />
          )}
        </div>
      </TooltipProvider>

      <div className="bg-card mt-10 flex items-start gap-2 rounded-lg border-2 px-4 py-3 text-stone-800">
        <InfoIcon className="mt-1 h-6 w-6 flex-[0_0_1.5rem] opacity-80" />
        <div className="space-y-1">
          <Text level="h3" weight="semibold">
            {m.east_best_tadpole_treat()}
          </Text>
          <Text level="sm">
            <ReplaceI18nFragment
              message={m.ago_mad_penguin_bump()}
              fragments={{
                link: ({ children }) => (
                  <Link
                    href={paths.editVegetable(vegetable.handle)}
                    className="font-semibold underline"
                  >
                    <Edit2Icon className="inline-block h-4 w-4" /> {children}
                  </Link>
                ),
              }}
            />
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
    <div className="relative flex max-w-full items-start gap-5 leading-normal">
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
          'wrap hide-scrollbar -mr-[calc(var(--page-padding-x)_*_2)] flex flex-1 gap-2 overflow-x-auto pr-[calc(var(--page-padding-x)_*_2)] lg:mr-0 lg:pr-0',
          Array.isArray(right) && '-ml-1',
        )}
        as={Array.isArray(right) ? 'div' : 'p'}
      >
        {Array.isArray(right) &&
          right.map((item) => {
            if (!item) return null

            if (typeof item === 'string') {
              return <Badge key={item}>{item}</Badge>
            }

            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Badge className="select-none">
                    {item.label}{' '}
                    <CircleHelp className="-mr-1 ml-1 h-4 w-4 opacity-80" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="bg-card border">
                  <Text level="sm" className="max-w-[20rem]">
                    {item.explainer}
                  </Text>
                </TooltipContent>
              </Tooltip>
            )
          })}
        {typeof right === 'string' &&
          right.split('\n').map((paragraph, idx, arr) => (
            <Fragment key={paragraph}>
              {paragraph}
              {idx < arr.length - 1 && <br />}
            </Fragment>
          ))}
      </Text>
    </div>
  )
}
