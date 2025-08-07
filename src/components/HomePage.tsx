import { LanguagesIcon, SearchIcon } from 'lucide-react'
import Image from 'next/image'
import Link from '@/components/LinkWithTransition'
import { m } from '@/paraglide/messages'
import { getLocale } from '@/paraglide/runtime'
import type { HomePageData, ResourceCardData } from '@/queries'
import { shuffleArray } from '@/utils/arrays'
import { paths } from '@/utils/urls'
import wikiPreview from '../wiki-preview.png'
import { ContributionCTA } from './ContributionCTA'
import BulbIcon from './icons/BulbIcon'
import HistoryIcon from './icons/HistoryIcon'
import LibraryIcon from './icons/LibraryIcon'
import NoteIcon from './icons/NoteIcon'
import RainbowIcon from './icons/RainbowIcon'
import NotesStrip from './NotesStrip'
import ProfilesGrid from './ProfilesGrid'
import ReplaceI18nFragments, { DEFAULT_FRAGMENTS } from './ReplaceI18nFragments'
import ResourceCard from './ResourceCard'
import SectionTitle from './SectionTitle'
import SuggestionsGrid from './SuggestionsGrid'
import { Button } from './ui/button'
import { Card, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Text } from './ui/text'
import VegetablesStrip from './VegetablesStrip'

export default async function HomePage(data: Partial<HomePageData>) {
  const featured_vegetables = shuffleArray(data.featured_vegetables || [])
  const profiles = shuffleArray(data.profiles || [])
  const notes = shuffleArray(data.notes || [])
  const locale = getLocale()

  return (
    <>
      <section className="flex flex-col items-center gap-[0.33em] px-2 pt-8 pb-12 text-center text-4xl md:pt-16 md:text-5xl lg:text-6xl xl:pt-24">
        <h1 className="text-primary-800 max-w-xl leading-none font-normal">
          <ReplaceI18nFragments
            message={m.grand_same_puffin_stir()}
            fragments={{
              ...DEFAULT_FRAGMENTS,
              strong: (props) => (
                <strong className="text-secondary-400 font-normal">
                  {props.children}
                </strong>
              ),
            }}
          />
        </h1>
        <Text
          level="h1"
          as="p"
          className="text-primary-800 max-w-3xl text-[0.5em]! leading-snug font-normal md:opacity-90"
        >
          {m.actual_every_halibut_find()}
        </Text>

        <form action="/vegetais" method="get" className="mt-2 flex">
          <Input
            type="text"
            name="nome"
            placeholder={m.proof_safe_warbler_arise()}
            className="h-[2.525rem] rounded-r-none"
          />
          <Button type="submit" className="rounded-l-none">
            <SearchIcon className="w-4" /> {m.left_lower_cobra_borrow()}
          </Button>
        </form>
      </section>
      {featured_vegetables && featured_vegetables.length > 0 && (
        <>
          <section className="space-y-9 overflow-x-hidden">
            <VegetablesStrip
              vegetables={featured_vegetables.slice(
                0,
                Math.min(featured_vegetables.length / 2),
              )}
            />
            <VegetablesStrip
              vegetables={featured_vegetables.slice(
                Math.min(featured_vegetables.length / 2),
              )}
              inverted
            />
          </section>
          <div className="mt-8 text-center">
            <Link
              href={paths.vegetablesIndex()}
              className="link text-xl font-medium"
            >
              {m.stock_weak_goat_race()}
            </Link>
          </div>
        </>
      )}
      <section className="mt-36 flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-2.5">
        <div className="pl-pageX pr-pageX box-content flex flex-col items-start gap-1 lg:flex-row xl:max-w-md xl:flex-[3_0_15rem] xl:pr-0 xl:pl-[calc(var(--page-padding-x)_-_2.625rem)]">
          <BulbIcon variant="color" className="w-8 flex-[0_0_2rem] lg:mt-1" />
          <div>
            <Text level="h2" as="h2">
              {m.main_trite_thrush_prosper()}
            </Text>
            <Text level="h3" className="max-w-lg font-normal">
              <ReplaceI18nFragments
                message={m.this_caring_hound_praise()}
                fragments={{
                  strong: (props) => (
                    <strong className="font-semibold">{props.children}</strong>
                  ),
                }}
              />
            </Text>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 lg:pt-10">
              <Button asChild>
                <Link href={paths.vegetablesIndex()}>
                  {m.weary_great_mule_charm()}
                </Link>
              </Button>
              <Link href={paths.newVegetable()} className="link font-medium">
                {m.spicy_flaky_antelope_lead()}
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-[min(100vw,70rem)] flex-1 xl:-mt-4">
          <Image
            src={wikiPreview}
            alt={m.legal_ago_turkey_devour()}
            quality={100}
          />
        </div>
      </section>

      {locale === 'es' && (
        <section className="px-pageX mt-14">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center gap-4">
              <LanguagesIcon className="text-primary-600 size-8 flex-[0_0_2rem]" />
              <div>
                <CardTitle>
                  Aún estamos preparando Gororobas en Español
                </CardTitle>
                <Text level="h3" as="p" weight="normal">
                  Por ahora, puedes intentar practicar tu Portunhol con el
                  contenido que ya existe 😅
                </Text>
              </div>
            </CardHeader>
          </Card>
        </section>
      )}

      {notes && notes.length > 0 && (
        <section className="mt-36 flex flex-col xl:flex-row xl:items-start xl:gap-2.5">
          <div className="pl-pageX pr-pageX box-content flex flex-col items-start gap-1 lg:flex-row xl:max-w-md xl:flex-[3_0_15rem] xl:pr-0 xl:pl-[calc(var(--page-padding-x)_-_2.625rem)]">
            <NoteIcon variant="color" className="w-8 flex-[0_0_2rem] lg:mt-1" />
            <div>
              <Text level="h2" as="h2">
                {m.loud_any_puffin_gleam()}
              </Text>
              <Text level="h3" className="max-w-lg font-normal">
                {m.witty_tasty_skunk_pause()}
              </Text>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 lg:pt-10">
                <Button asChild>
                  <Link href={paths.newNote()}>
                    {m.lost_main_kudu_engage()}
                  </Link>
                </Button>
                <Link href={paths.notesIndex()} className="link font-medium">
                  {m.helpful_loose_gecko_jest()}
                </Link>
              </div>
            </div>
          </div>

          <div className="hide-scrollbar flex-1 overflow-x-auto px-4 py-10 lg:overflow-x-hidden lg:px-10 xl:-mt-5">
            <NotesStrip notes={notes} />
          </div>
        </section>
      )}

      {data.featured_resources && data.featured_resources.length > 0 && (
        <section className="mt-36 flex flex-col xl:flex-row xl:items-start xl:gap-2.5">
          <div className="pl-pageX pr-pageX box-content flex flex-col items-start gap-1 lg:flex-row xl:max-w-md xl:flex-[3_0_15rem] xl:pr-0 xl:pl-[calc(var(--page-padding-x)_-_2.625rem)]">
            <LibraryIcon
              variant="color"
              className="w-8 flex-[0_0_2rem] lg:mt-1"
            />
            <div>
              <Text level="h2" as="h2">
                {m.north_green_worm_loop()}
              </Text>
              <Text level="h3" className="max-w-lg font-normal">
                {m.basic_teal_fish_laugh()}
              </Text>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 lg:pt-10">
                <Button asChild>
                  <Link href={paths.newResource()}>
                    {m.loud_extra_squirrel_value()}
                  </Link>
                </Button>
                <Link
                  href={paths.resourcesIndex()}
                  className="link font-medium"
                >
                  {m.direct_ok_lamb_snip()}
                </Link>
              </div>
            </div>
          </div>

          <div className="hide-scrollbar flex-1 overflow-x-auto px-4 py-10 lg:overflow-x-hidden lg:px-10 xl:-mt-5">
            <div
              className={'flex w-auto justify-start gap-9 *:flex-[1_0_250px]'}
            >
              {data.featured_resources.map((resource) => (
                <ResourceCard
                  key={resource.handle}
                  resource={resource as ResourceCardData}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {data.recent_contributions && data.recent_contributions.length > 0 && (
        <section className="mt-36">
          <SectionTitle Icon={HistoryIcon}>
            {m.heroic_jolly_pug_clap()}
          </SectionTitle>
          <SuggestionsGrid
            suggestions={data.recent_contributions}
            className="px-pageX mt-6"
          />
        </section>
      )}

      {profiles && profiles.length > 0 && (
        <section className="mt-36">
          <SectionTitle Icon={RainbowIcon}>
            {m.equal_shy_chicken_burn()}
          </SectionTitle>
          <Text level="h3" className="px-pageX font-normal">
            {m.topical_gross_macaw_trust()}
          </Text>
          <ProfilesGrid profiles={profiles} className="px-pageX mt-8" />
        </section>
      )}

      <ContributionCTA />

      <div aria-hidden className="mt-36" />
    </>
  )
}
