import type { HomePageData, ResourceCardData } from '@/queries'
import { shuffleArray } from '@/utils/arrays'
import { getUserLocale, type Locale } from '@/utils/i18n'
import { paths } from '@/utils/urls'
import { LanguagesIcon, SearchIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import wikiPreview from '../wiki-preview.png'
import { ContributionCTA } from './ContributionCTA'
import BulbIcon from './icons/BulbIcon'
import HistoryIcon from './icons/HistoryIcon'
import LibraryIcon from './icons/LibraryIcon'
import NoteIcon from './icons/NoteIcon'
import RainbowIcon from './icons/RainbowIcon'
import NotesStrip from './NotesStrip'
import ProfilesGrid from './ProfilesGrid'
import ResourceCard from './ResourceCard'
import SectionTitle from './SectionTitle'
import SuggestionsGrid from './SuggestionsGrid'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Text } from './ui/text'
import VegetablesStrip from './VegetablesStrip'

/** Makeshift solution for internationalizing the homepage only */
const LOCALIZED_CONTENT = {
  pt: {
    title: (
      <>
        Por terra, território,
        <br /> e{' '}
        <strong className="text-secondary-400 font-normal">gororobas</strong>
      </>
    ),
    subtitle:
      'Enciclopédia colaborativa de conhecimento em agroecologia sobre mais de 400 vegetais',
    searchPlaceholder: 'Buscar vegetais...',
    searchButton: 'Buscar',
    browseAllVegetables: 'Navegue todos os vegetais',
    encyclopediaTitle: 'Enciclopédia agroecológica',
    encyclopediaDescription: (
      <>
        Informações sobre centenas de vegetais baseadas em conhecimentos e
        experiências de diversas pessoas,{' '}
        <strong className="font-semibold">inclusive você</strong>
      </>
    ),
    allVegetablesButton: 'Todos os vegetais',
    submitNewVegetable: 'Envie novo vegetal',
    notesTitle: 'Aprendizados e experimentos',
    notesDescription:
      'Na cozinha, no plantio e no sacolão. Uma rede social agroecológica, por assim dizer',
    submitYourNote: 'Enviar sua nota',
    allNotes: 'Todas as notas',
    libraryTitle: 'Biblioteca agroecológica',
    libraryDescription:
      'Livros, organizações, vídeos e mais sobre agroecologia, agrofloresta e a luta por terra e território.',
    submitMaterial: 'Enviar um material',
    allMaterials: 'Todos materiais',
    recentContributions: 'Contribuições recentes',
    whoIsInvolved: 'Quem se envolve',
    communityDescription:
      'Cultivando sabedoria e compartilhando experiências para agroecologizar o mundo ✨',
    contributionCTA: {
      title: 'Gororobas é um espaço colaborativo',
      subtitle:
        'Iríamos adorar receber suas notinhas ou conhecimento sobre plantas e agroecologia',
      newNoteLabel: 'Envie sua nota',
      newVegetableLabel: 'Envie novo vegetal',
    },
  },
  es: {
    title: (
      <>
        Por tierra, territorio,
        <br /> y{' '}
        <strong className="text-secondary-400 font-normal">gororobas</strong>
      </>
    ),
    subtitle:
      'Enciclopedia colaborativa de conocimiento en agroecología sobre más de 400 vegetales',
    searchPlaceholder: 'Buscar vegetales...',
    searchButton: 'Buscar',
    browseAllVegetables: 'Navegar todos los vegetales',
    encyclopediaTitle: 'Enciclopedia agroecológica',
    encyclopediaDescription: (
      <>
        Información sobre cientos de vegetales basada en conocimientos y
        experiencias de diversas personas,{' '}
        <strong className="font-semibold">incluyéndote</strong>
      </>
    ),
    allVegetablesButton: 'Todos los vegetales',
    submitNewVegetable: 'Enviar nuevo vegetal',
    notesTitle: 'Aprendizajes y experimentos',
    notesDescription:
      'En la cocina, en el cultivo y en el mercado. Una red social agroecológica, por así decirlo',
    submitYourNote: 'Enviar tu nota',
    allNotes: 'Todas las notas',
    libraryTitle: 'Biblioteca agroecológica',
    libraryDescription:
      'Libros, organizaciones, videos y más sobre agroecología, agroforestería y la lucha por tierra y territorio.',
    submitMaterial: 'Enviar un material',
    allMaterials: 'Todos los materiales',
    recentContributions: 'Contribuciones recientes',
    whoIsInvolved: 'Quiénes participan',
    communityDescription:
      'Cultivando sabiduría y compartiendo experiencias para agroecologizar el mundo ✨',
    contributionCTA: {
      title: 'Gororobas es un espacio colaborativo',
      subtitle:
        'Iriamos adorar recibir sus notas o conocimiento sobre plantas y agroecología',
      newNoteLabel: 'Envie su nota',
      newVegetableLabel: 'Envie un nuevo vegetal',
    },
  },
} as const satisfies Record<Locale, unknown>

export default async function HomePage(data: Partial<HomePageData>) {
  const featured_vegetables = shuffleArray(data.featured_vegetables || [])
  const profiles = shuffleArray(data.profiles || [])
  const notes = shuffleArray(data.notes || [])
  const locale = await getUserLocale()
  const content = LOCALIZED_CONTENT[locale]

  return (
    <>
      <section className="flex flex-col items-center gap-[0.33em] px-2 pt-8 pb-12 text-center text-4xl md:pt-16 md:text-5xl lg:text-6xl xl:pt-24">
        <h1 className="text-primary-800 max-w-xl leading-none font-normal">
          {content.title}
        </h1>
        <Text
          level="h1"
          as="p"
          className="text-primary-800 max-w-3xl text-[0.5em]! leading-snug font-normal md:opacity-90"
        >
          {content.subtitle}
        </Text>

        <form action="/vegetais" method="get" className="mt-2 flex">
          <Input
            type="text"
            name="nome"
            placeholder={content.searchPlaceholder}
            className="h-[2.525rem] rounded-r-none"
          />
          <Button type="submit" className="rounded-l-none">
            <SearchIcon className="w-4" /> {content.searchButton}
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
              {content.browseAllVegetables}
            </Link>
          </div>
        </>
      )}
      <section className="mt-36 flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-2.5">
        <div className="pl-pageX pr-pageX box-content flex flex-col items-start gap-1 lg:flex-row xl:max-w-md xl:flex-[3_0_15rem] xl:pr-0 xl:pl-[calc(var(--page-padding-x)_-_2.625rem)]">
          <BulbIcon variant="color" className="w-8 flex-[0_0_2rem] lg:mt-1" />
          <div>
            <Text level="h2" as="h2">
              {content.encyclopediaTitle}
            </Text>
            <Text level="h3" className="max-w-lg font-normal">
              {content.encyclopediaDescription}
            </Text>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 lg:pt-10">
              <Button asChild>
                <Link href={paths.vegetablesIndex()}>
                  {content.allVegetablesButton}
                </Link>
              </Button>
              <Link href={paths.newVegetable()} className="link font-medium">
                {content.submitNewVegetable}
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
            <CardContent>
              <Text>
                Trabajas con programación y quieres ayudar?
                <br /> Nustro codigo es abierto y buscamos alguién para la{' '}
                <a
                  href="https://github.com/hdoro/gororobas/issues/82"
                  className="link font-semibold"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  tarea de internacionalización del aplicativo
                </a>{' '}
                🙏
              </Text>
            </CardContent>
          </Card>
        </section>
      )}

      {notes && notes.length > 0 && (
        <section className="mt-36 flex flex-col xl:flex-row xl:items-start xl:gap-2.5">
          <div className="pl-pageX pr-pageX box-content flex flex-col items-start gap-1 lg:flex-row xl:max-w-md xl:flex-[3_0_15rem] xl:pr-0 xl:pl-[calc(var(--page-padding-x)_-_2.625rem)]">
            <NoteIcon variant="color" className="w-8 flex-[0_0_2rem] lg:mt-1" />
            <div>
              <Text level="h2" as="h2">
                {content.notesTitle}
              </Text>
              <Text level="h3" className="max-w-lg font-normal">
                {content.notesDescription}
              </Text>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 lg:pt-10">
                <Button asChild>
                  <Link href={paths.newNote()}>{content.submitYourNote}</Link>
                </Button>
                <Link href={paths.notesIndex()} className="link font-medium">
                  {content.allNotes}
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
                {content.libraryTitle}
              </Text>
              <Text level="h3" className="max-w-lg font-normal">
                {content.libraryDescription}
              </Text>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 lg:pt-10">
                <Button asChild>
                  <Link href={paths.newResource()}>
                    {content.submitMaterial}
                  </Link>
                </Button>
                <Link
                  href={paths.resourcesIndex()}
                  className="link font-medium"
                >
                  {content.allMaterials}
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
            {content.recentContributions}
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
            {content.whoIsInvolved}
          </SectionTitle>
          <Text level="h3" className="px-pageX font-normal">
            {content.communityDescription}
          </Text>
          <ProfilesGrid profiles={profiles} className="px-pageX mt-8" />
        </section>
      )}

      <ContributionCTA
        title={content.contributionCTA.title}
        subtitle={content.contributionCTA.subtitle}
        newNoteLabel={content.contributionCTA.newNoteLabel}
        newVegetableLabel={content.contributionCTA.newVegetableLabel}
      />

      <div aria-hidden className="mt-36" />
    </>
  )
}
