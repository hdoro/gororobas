import { ContributionCTA } from '@/components/ContributionCTA'
import FullscreenPhotos from '@/components/FullscreenPhotos'
import Link from '@/components/LinkWithTransition'
import NotesGrid from '@/components/NotesGrid'
import ResourceCard from '@/components/ResourceCard'
import SectionTitle from '@/components/SectionTitle'
import { SendTipDialog } from '@/components/SendTipDialog'
import SourcesGrid from '@/components/SourcesGrid'
import VegetableVarietyCard from '@/components/VegetableVarietyCard'
import VegetablesGrid from '@/components/VegetablesGrid'
import BulbIcon from '@/components/icons/BulbIcon'
import NoteIcon from '@/components/icons/NoteIcon'
import QuoteIcon from '@/components/icons/QuoteIcon'
import RainbowIcon from '@/components/icons/RainbowIcon'
import ShovelIcon from '@/components/icons/ShovelIcon'
import VegetableFriendsIcon from '@/components/icons/VegetableFriendsIcon'
import TipTapRenderer from '@/components/tiptap/DefaultTipTapRenderer'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { m } from '@/paraglide/messages'
import type { ResourceCardData, VegetablePageData } from '@/queries'
import { isRenderableRichText } from '@/utils/tiptap'
import { paths } from '@/utils/urls'
import { Edit2Icon } from 'lucide-react'
import { Suspense } from 'react'
import VegetableContributors from './VegetableContributors'
import { VegetablePageHero } from './VegetablePageHero'
import VegetablePageSidebar from './VegetablePageSidebar'
import VegetableTips from './VegetableTips'

export default function VegetablePage({
  vegetable,
}: {
  vegetable: VegetablePageData
}) {
  const { names = [], sources = [] } = vegetable

  const friends = vegetable.friends || []

  const externalSources = sources.flatMap((source, index) => {
    if (source?.type !== 'EXTERNAL') return []

    return (
      sources
        .slice(index + 1)
        // Avoid displaying duplicates
        .some(
          (s) =>
            s.credits === source.credits ||
            (source.origin && s.origin === source.origin),
        )
        ? []
        : source
    )
  })

  const carouselPhotos = [
    ...(vegetable.photos || []),
    ...(vegetable.varieties || []).flatMap((v) => v.photos || []),
  ].flatMap((p) => (p.sanity_id ? p : []))
  return (
    <FullscreenPhotos photos={carouselPhotos}>
      <main className="py-12">
        <div
          className="px-pageX relative flex flex-col gap-[4.5rem] overflow-x-hidden lg:flex-row lg:items-start lg:overflow-x-visible"
          id="visao-geral"
        >
          <VegetablePageHero vegetable={vegetable} />
          <VegetablePageSidebar
            vegetable={vegetable}
            hasExternalSources={externalSources.length > 0}
          />
        </div>
        <section className="my-36" id="sugestoes">
          <SectionTitle
            Icon={ShovelIcon}
            CTA={
              vegetable.tips.length > 0 ? (
                <SendTipDialog vegetable={vegetable} />
              ) : null
            }
          >
            {m.patient_real_crab_nail()}
          </SectionTitle>
          {vegetable.tips.length > 0 ? (
            <VegetableTips tips={vegetable.tips} vegetable={vegetable} />
          ) : (
            <div className="px-pageX mt-1 space-y-2">
              <Text level="p">{m.late_arable_bulldog_blink()}</Text>
              <SendTipDialog vegetable={vegetable} />
            </div>
          )}
        </section>
        {Array.isArray(vegetable.varieties) &&
          vegetable.varieties.length > 0 && (
            <section className="my-36" id="variedades">
              <SectionTitle Icon={RainbowIcon}>
                {m.busy_candid_cockroach_radiate()}
              </SectionTitle>
              <div className="hide-scrollbar px-pageX mt-3 flex gap-6 overflow-x-auto xl:gap-20">
                {vegetable.varieties.map((variety) => (
                  <VegetableVarietyCard
                    key={variety.handle}
                    variety={variety}
                  />
                ))}
              </div>
            </section>
          )}
        {isRenderableRichText(vegetable.content) && (
          <section className="my-36" id="curiosidades">
            <SectionTitle Icon={BulbIcon}>
              {m.civil_deft_dove_achieve({
                name: names[0],
                gender: vegetable.gender || 'NEUTRO',
              })}
            </SectionTitle>
            <div className="px-pageX mt-5 box-content max-w-[39.375rem] space-y-3 text-base">
              <TipTapRenderer content={vegetable.content} />
            </div>
          </section>
        )}
        {friends.length > 0 && (
          <section className="my-36" id="amizades">
            <SectionTitle Icon={VegetableFriendsIcon}>
              {m.slow_neat_niklas_bump({
                name: names[0],
                gender: vegetable.gender || 'NEUTRO',
              })}
            </SectionTitle>
            <Text level="h3" className="px-pageX font-normal">
              {m.noble_east_jurgen_gleam({
                name: names[0],
                gender: vegetable.gender || 'NEUTRO',
              })}
            </Text>
            <VegetablesGrid vegetables={friends} className="px-pageX mt-6" />
          </section>
        )}
        {(externalSources.length || vegetable.related_resources.length) > 0 && (
          <section className="my-36" id="fontes">
            <SectionTitle Icon={QuoteIcon}>
              {m.loud_happy_rooster_tap()}
            </SectionTitle>
            <Text level="h3" className="px-pageX font-normal">
              {m.stale_last_bulldog_rush()}
            </Text>
            {externalSources.length > 0 && (
              <SourcesGrid
                sources={externalSources}
                className="px-pageX mt-6"
              />
            )}
            {vegetable.related_resources.length > 0 && (
              <div className="px-page-x mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {vegetable.related_resources.map((related_resource) => (
                  <ResourceCard
                    key={related_resource.id}
                    resource={related_resource as ResourceCardData}
                  />
                ))}
              </div>
            )}
          </section>
        )}
        <section className="my-36" id="notas">
          <SectionTitle
            Icon={NoteIcon}
            CTA={
              vegetable.related_notes.length > 0 ? (
                <Button asChild>
                  <Link href={paths.newNote()}>
                    {m.bad_honest_salmon_arise()}
                  </Link>
                </Button>
              ) : null
            }
          >
            {m.orange_front_myna_revive()}
          </SectionTitle>
          {vegetable.related_notes.length > 0 ? (
            <NotesGrid notes={vegetable.related_notes} />
          ) : (
            <Text level="p" className="px-pageX mt-1">
              {m.simple_heroic_cougar_catch()}{' '}
              <Link href={paths.newNote()} className="link">
                {m.steep_weird_kudu_gaze()}
              </Link>
              ?
            </Text>
          )}
        </section>
        <ContributionCTA
          customCTA={
            <Button asChild>
              <Link href={paths.editVegetable(vegetable.handle)}>
                <Edit2Icon className="w-[1.25em]" />
                {m.tame_loud_alligator_zap({
                  name: names[0],
                  gender: vegetable.gender || 'NEUTRO',
                })}
              </Link>
            </Button>
          }
        />
        <Suspense>
          <VegetableContributors vegetable={vegetable} />
        </Suspense>
      </main>
    </FullscreenPhotos>
  )
}
