import type { HomePageData } from '@/queries'
import { shuffleArray } from '@/utils/arrays'
import { paths } from '@/utils/urls'
import Link from 'next/link'
import NotesGrid from './NotesGrid'
import ProfilesGrid from './ProfilesGrid'
import SectionTitle from './SectionTitle'
import VegetablesStrip from './VegetablesStrip'
import NoteIcon from './icons/NoteIcon'
import RainbowIcon from './icons/RainbowIcon'
import SeedlingIcon from './icons/SeedlingIcon'
import SparklesIcon from './icons/SparklesIcon'
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
						<VegetablesStrip vegetables={featured_vegetables.slice(0, 6)} />
						{featured_vegetables.length > 6 && (
							<VegetablesStrip
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
					<Text level="h3" className="px-pageX mx-10 font-normal">
						Na cozinha, no plantio e no sacolão
					</Text>
					<NotesGrid notes={notes} />

					<div className="mt-8 text-center">
						<Link
							href={paths.notesIndex()}
							className="text-primary-700 underline font-medium text-xl"
						>
							Todas as notas
						</Link>
					</div>
				</section>
			)}
			{profiles && profiles.length > 0 && (
				<section className="mt-36">
					<SectionTitle Icon={RainbowIcon}>Quem se envolve</SectionTitle>
					<ProfilesGrid profiles={profiles} />
				</section>
			)}

			<section className="my-36 px-pageX text-center md:max-w-lg mx-auto box-content">
				<SparklesIcon variant="color" className="w-12 inline-block mb-3" />
				<Text level="h2" as="h2">
					Gororobas é um espaço colaborativo
				</Text>
				<Text>
					Iríamos adorar receber suas notinhas ou conhecimento sobre plantas e
					agroecologia{' '}
				</Text>
				<div className="flex items-center justify-center gap-3 mt-5">
					<Button asChild tone="secondary" mode="outline">
						<Link href={paths.newNote()}>
							<NoteIcon variant="monochrome" className="w-[1.25em]" /> Enviar
							sua nota
						</Link>
					</Button>
					<span className="text-muted-foreground">ou</span>
					<Button asChild>
						<Link href={paths.newVegetable()}>
							<SeedlingIcon variant="monochrome" className="w-[1.25em]" />{' '}
							Enviar um novo vegetal
						</Link>
					</Button>
				</div>
			</section>
		</>
	)
}
