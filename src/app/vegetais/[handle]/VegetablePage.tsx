import { ContributionCTA } from '@/components/ContributionCTA'
import FullscreenPhotos from '@/components/FullscreenPhotos'
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
import type { ResourceCardData, VegetablePageData } from '@/queries'
import { gender } from '@/utils/strings'
import { isRenderableRichText } from '@/utils/tiptap'
import { paths } from '@/utils/urls'
import { Edit2Icon } from 'lucide-react'
import Link from 'next/link'
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
            Sugestões e dicas
          </SectionTitle>
          {vegetable.tips.length > 0 ? (
            <VegetableTips tips={vegetable.tips} vegetable={vegetable} />
          ) : (
            <div className="px-pageX mt-1 space-y-2">
              <Text level="p">
                Ainda não temos dicas sobre esse vegetal. Que tal enviar a sua?
              </Text>
              <SendTipDialog vegetable={vegetable} />
            </div>
          )}
        </section>
        {Array.isArray(vegetable.varieties) &&
          vegetable.varieties.length > 0 && (
            <section className="my-36" id="variedades">
              <SectionTitle Icon={RainbowIcon}>Variedades</SectionTitle>
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
              Sobre {gender.article(vegetable.gender || 'NEUTRO', 'both')}
              {names[0]}
            </SectionTitle>
            <div className="px-pageX mt-5 box-content max-w-[39.375rem] space-y-3 text-base">
              <TipTapRenderer content={vegetable.content} />
            </div>
          </section>
        )}
        {friends.length > 0 && (
          <section className="my-36" id="amizades">
            <SectionTitle Icon={VegetableFriendsIcon}>
              Amigues d{gender.suffix(vegetable.gender || 'NEUTRO')} {names[0]}
            </SectionTitle>
            <Text level="h3" className="px-pageX font-normal">
              Plantas que gostam de serem plantadas e estarem próximas a
              {gender.suffix(vegetable.gender || 'NEUTRO')} {names[0]}
            </Text>
            <VegetablesGrid vegetables={friends} className="px-pageX mt-6" />
          </section>
        )}
        {(externalSources.length || vegetable.related_resources.length) > 0 && (
          <section className="my-36" id="fontes">
            <SectionTitle Icon={QuoteIcon}>Fontes e recursos</SectionTitle>
            <Text level="h3" className="px-pageX font-normal">
              Fontes que embasaram essas informações e recursos para ir mais a
              fundo
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
                  <Link href={paths.newNote()}>Enviar sua nota</Link>
                </Button>
              ) : null
            }
          >
            Aprendizados e experimentos
          </SectionTitle>
          {vegetable.related_notes.length > 0 ? (
            <NotesGrid notes={vegetable.related_notes} />
          ) : (
            <Text level="p" className="px-pageX mt-1">
              Ainda não temos notas sobre esse vegetal. Que tal{' '}
              <Link href={paths.newNote()} className="link">
                enviar uma
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
                Editar página {gender.preposition(
                  vegetable.gender || 'NEUTRO',
                )}{' '}
                {vegetable.names[0]}
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
