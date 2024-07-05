import { auth } from '@/edgedb'
import type { HomePageData } from '@/queries'
import { shuffleArray } from '@/utils/arrays'
import { paths } from '@/utils/urls'
import { Edit2Icon } from 'lucide-react'
import Link from 'next/link'
import { ContributionCTA } from './ContributionCTA'
import NotesGrid from './NotesGrid'
import ProfilesGrid from './ProfilesGrid'
import SectionTitle from './SectionTitle'
import SuggestionCard from './SuggestionCard'
import VegetablesStrip from './VegetablesStrip'
import NoteIcon from './icons/NoteIcon'
import RainbowIcon from './icons/RainbowIcon'
import { Button } from './ui/button'
import { Text } from './ui/text'

export default async function HomePage(data: Partial<HomePageData>) {
	const featured_vegetables = shuffleArray(data.featured_vegetables || [])
	const profiles = shuffleArray(data.profiles || [])
	const notes = shuffleArray(data.notes || [])

	const session = auth.getSession()
	const signedIn = await session.isSignedIn()

	return (
		<>
			<section className="text-center text-4xl md:text-5xl lg:text-6xl flex flex-col items-center gap-[0.33em] px-2 pt-24 pb-12">
				<h1 className="text-primary-800 max-w-xl font-normal">
					Por terra, território,
					<br /> e{' '}
					<strong className="text-secondary-400 font-normal">gororobas</strong>
				</h1>
				<Text
					level="h1"
					as="p"
					className="text-primary-800 font-normal max-w-3xl !text-[0.5em] leading-snug"
				>
					Enciclopédia colaborativa de conhecimento em agroecologia sobre mais
					de 400 vegetais
				</Text>
			</section>
			{featured_vegetables && featured_vegetables.length > 0 && (
				<>
					<section className="overflow-x-hidden space-y-9 -ml-[calc(var(--vegetable-card-width)_/_2)]">
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
							className="link font-medium text-xl"
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
							className="link font-medium text-xl"
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
					<SectionTitle Icon={RainbowIcon}>Contribuições recentes</SectionTitle>
					<div className="grid gap-3 grid-cols-[repeat(auto-fit,_minmax(15rem,_1fr))] mt-6 px-pageX">
						{data.recent_contributions.map((suggestion) => (
							<SuggestionCard key={suggestion.id} suggestion={suggestion} />
						))}
					</div>
				</section>
			)}

			<div aria-hidden className="mt-36" />

			{signedIn && (
				<Button size="sm" asChild className="fixed left-4 bottom-4 z-50">
					<Link href={paths.newNote()}>
						<Edit2Icon className="w-[1.25em]" /> Enviar nota
					</Link>
				</Button>
			)}
		</>
	)
}
