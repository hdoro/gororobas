import { auth } from '@/edgedb'
import type { HomePageData } from '@/queries'
import { shuffleArray } from '@/utils/arrays'
import { paths } from '@/utils/urls'
import { Edit2Icon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { ContributionCTA } from './ContributionCTA'
import NotesGrid from './NotesGrid'
import ProfilesGrid from './ProfilesGrid'
import SectionTitle from './SectionTitle'
import SuggestionsGrid from './SuggestionsGrid'
import VegetablesStrip from './VegetablesStrip'
import HistoryIcon from './icons/HistoryIcon'
import NoteIcon from './icons/NoteIcon'
import RainbowIcon from './icons/RainbowIcon'
import { Button } from './ui/button'
import { Text } from './ui/text'
import { Input } from './ui/input'

export default async function HomePage(data: Partial<HomePageData>) {
  const featured_vegetables = shuffleArray(data.featured_vegetables || [])
  const profiles = shuffleArray(data.profiles || [])
  const notes = shuffleArray(data.notes || [])

  const session = auth.getSession()
  const signedIn = await session.isSignedIn()

  return (
    <>
      <section className="flex flex-col items-center gap-[0.33em] px-2 pb-12 pt-24 text-center text-4xl md:text-5xl lg:text-6xl">
        <h1 className="max-w-xl font-normal text-primary-800">
          Por terra, território,
          <br /> e{' '}
          <strong className="font-normal text-secondary-400">gororobas</strong>
        </h1>
        <Text
          level="h1"
          as="p"
          className="max-w-3xl !text-[0.5em] font-normal leading-snug text-primary-800"
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
        <section className="mt-36">
          <SectionTitle
            Icon={NoteIcon}
            CTA={
              <Button asChild>
                <Link href={paths.newNote()}>Enviar sua nota</Link>
              </Button>
            }
          >
            Aprendizados e experimentos
          </SectionTitle>
          <Text level="h3" className="px-pageX font-normal">
            Na cozinha, no plantio e no sacolão
          </Text>
          <NotesGrid notes={notes} />

          <div className="mt-8 text-center">
            <Link
              href={paths.notesIndex()}
              className="link text-xl font-medium"
            >
              Todas as notas
            </Link>
          </div>
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

      {data.recent_contributions && data.recent_contributions.length > 0 && (
        <section className="mt-36">
          <SectionTitle Icon={HistoryIcon}>Contribuições recentes</SectionTitle>
          <SuggestionsGrid
            suggestions={data.recent_contributions}
            className="mt-6 px-pageX"
          />
        </section>
      )}

      <div aria-hidden className="mt-36" />

      {signedIn && (
        <Button size="sm" asChild className="fixed bottom-4 left-4 z-50">
          <Link href={paths.newNote()}>
            <Edit2Icon className="w-[1.25em]" /> Enviar nota
          </Link>
        </Button>
      )}
    </>
  )
}
