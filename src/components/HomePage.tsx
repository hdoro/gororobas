import type { HomePageData } from '@/queries'
import { shuffleArray } from '@/utils/arrays'
import { paths } from '@/utils/urls'
import Link from 'next/link'
import AutoScrollingStrip from './AutoScrollingStrip'
import NotesGrid from './NotesGrid'
import SectionTitle from './SectionTitle'
import UserAvatar from './UserAvatar'
import NoteIcon from './icons/NoteIcon'
import RainbowIcon from './icons/RainbowIcon'
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
						<AutoScrollingStrip vegetables={featured_vegetables.slice(0, 6)} />
						{featured_vegetables.length > 6 && (
							<AutoScrollingStrip
								vegetables={featured_vegetables.slice(6)}
								offset
							/>
						)}
					</section>
					<div className="mt-8 text-center">
						<Link
							href={paths.vegetablesIndex()}
							className="text-primary-700 underline font-medium text-xl"
						>
							Navegue todos os vegetais
						</Link>
					</div>
				</>
			)}
			{notes && notes.length > 0 && (
				<section className="mt-36">
					<SectionTitle Icon={NoteIcon}>
						Aprendizados e experimentos
					</SectionTitle>
					<Text level="h3" className="px-pageX mx-10 font-normal">
						Na cozinha, no plantio e no sacolão
					</Text>
					<NotesGrid notes={notes} />
				</section>
			)}
			{profiles && profiles.length > 0 && (
				<section className="mt-36">
					<SectionTitle Icon={RainbowIcon}>Quem se envolve</SectionTitle>
					<div className="flex overflow-auto gap-12 mt-10 px-pageX hide-scrollbar">
						{profiles.map((profile) => (
							<UserAvatar key={profile.handle} user={profile} size="md" />
						))}
					</div>
				</section>
			)}
		</>
	)
}
