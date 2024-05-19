import type { HomePageData } from '@/queries'
import { paths } from '@/utils/urls'
import Link from 'next/link'
import AutoScrollingStrip from './AutoScrollingStrip'
import SectionTitle from './SectionTitle'
import UserAvatar from './UserAvatar'
import SeedlingIcon from './icons/SeedlingIcon'
import { Text } from './ui/text'

export default function HomePage({
	featured_vegetables,
	profiles,
}: Partial<HomePageData>) {
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
					<section className="overflow-x-hidden space-y-9 -ml-[calc(var(--vegetable-card-size)_/_2)]">
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
			{profiles && profiles.length > 0 && (
				<section className="mt-36">
					<SectionTitle Icon={SeedlingIcon}>Quem se envolve</SectionTitle>
					<div className="flex overflow-auto gap-12 mt-10 px-pageX hide-scrollbar">
						{profiles.map((profile) => (
							<UserAvatar key={profile.handle} user={profile} size="lg" />
						))}
					</div>
				</section>
			)}
		</>
	)
}
