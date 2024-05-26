import type { HomePageData } from '@/queries'
import { shuffleArray } from '@/utils/arrays'
import { paths } from '@/utils/urls'
import Link from 'next/link'
import { ContributionCTA } from './ContributionCTA'
import NotesGrid from './NotesGrid'
import ProfilesGrid from './ProfilesGrid'
import SectionTitle from './SectionTitle'
import VegetablesStrip from './VegetablesStrip'
import NoteIcon from './icons/NoteIcon'
import RainbowIcon from './icons/RainbowIcon'
import { Button } from './ui/button'
import { Text } from './ui/text'

export default function HomePage(data: Partial<HomePageData>) {
	const featured_vegetables = shuffleArray(data.featured_vegetables || [])
	const profiles = shuffleArray(data.profiles || [])
	const notes = shuffleArray(data.notes || [])

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
					className="text-primary-800 font-normal max-w-3xl text-[0.6em] leading-snug"
				>
					Cultivando sabedoria e compartilhando experiências para agroecologizar
					o mundo
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
					<ProfilesGrid profiles={profiles} className="mt-8 px-pageX" />
				</section>
			)}

			<ContributionCTA />
		</>
	)
}
