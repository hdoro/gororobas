import { auth } from '@/edgedb'
import type { HomePageData } from '@/queries'
import { shuffleArray } from '@/utils/arrays'
import { paths } from '@/utils/urls'
import { SearchIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import wikiPreview from '../wiki-preview.png'
import { ContributionCTA } from './ContributionCTA'
import NotesStrip from './NotesStrip'
import ProfilesGrid from './ProfilesGrid'
import SectionTitle from './SectionTitle'
import SuggestionsGrid from './SuggestionsGrid'
import VegetablesStrip from './VegetablesStrip'
import BulbIcon from './icons/BulbIcon'
import HistoryIcon from './icons/HistoryIcon'
import NoteIcon from './icons/NoteIcon'
import RainbowIcon from './icons/RainbowIcon'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Text } from './ui/text'

export default async function HomePage(data: Partial<HomePageData>) {
  const featured_vegetables = shuffleArray(data.featured_vegetables || [])
  const profiles = shuffleArray(data.profiles || [])
  const notes = shuffleArray(data.notes || [])

  const session = auth.getSession()
  const signedIn = await session.isSignedIn()

  return (
    <>
      <section className="flex flex-col items-center gap-[0.33em] px-2 pb-12 pt-8 text-center text-4xl md:pt-16 md:text-5xl lg:text-6xl xl:pt-24">
        <h1 className="max-w-xl font-normal leading-none text-primary-800">
          Por terra, território,
          <br /> e{' '}
          <strong className="font-normal text-secondary-400">gororobas</strong>
        </h1>
        <Text
          level="h1"
          as="p"
          className="max-w-3xl !text-[0.5em] font-normal leading-snug text-primary-800 md:opacity-90"
        >
          Enciclopédia colaborativa de conhecimento em agroecologia sobre mais
          de 400 vegetais
        </Text>

        <form action="/vegetais" method="get" className="mt-2 flex">
          <Input
            type="text"
            name="nome"
            placeholder="Buscar vegetais..."
            className="h-[2.525rem] rounded-r-none"
          />
          <Button type="submit" className="rounded-l-none">
            <SearchIcon className="w-4" /> Buscar
          </Button>
        </form>
      </section>
      {featured_vegetables && featured_vegetables.length > 0 && (
        <>
          <section className="-ml-[calc(var(--vegetable-card-width)_/_2)] space-y-9 overflow-x-hidden">
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
              offset
            />
          </section>
          <div className="mt-8 text-center">
            <Link
              href={paths.vegetablesIndex()}
              className="link text-xl font-medium"
            >
              Navegue todos os vegetais
            </Link>
          </div>
        </>
      )}
      {notes && notes.length > 0 && (
        <section className="mt-36 flex flex-col xl:flex-row xl:items-start xl:gap-2.5">
          <div className="box-content flex flex-col items-start gap-1 pl-pageX pr-pageX lg:flex-row xl:max-w-md xl:flex-[3_0_15rem] xl:pl-[calc(var(--page-padding-x)_-_2.625rem)] xl:pr-0">
            <NoteIcon variant="color" className="w-8 flex-[0_0_2rem] lg:mt-1" />
            <div>
              <Text level="h2" as="h2">
                Aprendizados e experimentos
              </Text>
              <Text level="h3" className="max-w-lg font-normal">
                Na cozinha, no plantio e no sacolão. <br />
                Uma rede social agroecológica, por assim dizer
              </Text>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 lg:pt-10">
                <Button asChild>
                  <Link href={paths.newNote()}>Enviar sua nota</Link>
                </Button>
                <Link href={paths.notesIndex()} className="link font-medium">
                  Todas as notas
                </Link>
              </div>
            </div>
          </div>

          <div className="hide-scrollbar flex-1 overflow-x-auto px-4 py-10 lg:overflow-x-hidden lg:px-10 xl:-mt-5">
            <NotesStrip notes={notes} />
          </div>
        </section>
      )}

      <section className="mt-36 flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-2.5">
        <div className="box-content flex flex-col items-start gap-1 pl-pageX pr-pageX lg:flex-row xl:max-w-md xl:flex-[3_0_15rem] xl:pl-[calc(var(--page-padding-x)_-_2.625rem)] xl:pr-0">
          <BulbIcon variant="color" className="w-8 flex-[0_0_2rem] lg:mt-1" />
          <div>
            <Text level="h2" as="h2">
              Enciclopédia agroecológica
            </Text>
            <Text level="h3" className="max-w-lg font-normal">
              Informações sobre centenas de vegetais baseadas em conhecimentos e
              experiências de diversas pessoas,{' '}
              <strong className="font-semibold">inclusive você</strong>
            </Text>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 lg:pt-10">
              <Button asChild>
                <Link href={paths.vegetablesIndex()}>Todos os vegetais</Link>
              </Button>
              <Link href={paths.newVegetable()} className="link font-medium">
                Envie novo vegetal
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-[min(100vw,70rem)] flex-1 xl:-mt-4">
          <Image
            src={wikiPreview}
            alt="Foto da página do milho na enciclopédia do Gororobas"
            quality={100}
          />
        </div>
      </section>

      {data.recent_contributions && data.recent_contributions.length > 0 && (
        <section className="mt-36">
          <SectionTitle Icon={HistoryIcon}>Contribuições recentes</SectionTitle>
          <SuggestionsGrid
            suggestions={data.recent_contributions}
            className="mt-6 px-pageX"
          />
        </section>
      )}

      {profiles && profiles.length > 0 && (
        <section className="mt-36">
          <SectionTitle Icon={RainbowIcon}>Quem se envolve</SectionTitle>
          <Text level="h3" className="px-pageX font-normal">
            Cultivando sabedoria e compartilhando experiências para
            agroecologizar o mundo ✨
          </Text>
          <ProfilesGrid profiles={profiles} className="mt-8 px-pageX" />
        </section>
      )}

      <ContributionCTA />

      <div aria-hidden className="mt-36" />
    </>
  )
}
