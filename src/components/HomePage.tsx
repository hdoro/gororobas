import type { HomePageData } from '@/queries'
import { Text } from './ui/text'
import VegetableCard from './VegetableCard'
import SeedlingIcon from './icons/SeedlingIcon'
import SectionTitle from './SectionTitle'
import UserAvatar from './UserAvatar'

export default function HomePage({
	featured_vegetables,
	profiles,
}: Partial<HomePageData>) {
	return (
		<>
			<section className="text-center flex flex-col items-center gap-5 px-2 pt-24">
				<h1 className="text-6xl text-primary-800 max-w-xl font-normal">
					Por terra, território,
					<br /> e{' '}
					<strong className="text-secondary-400 font-normal">gororobas</strong>
				</h1>
				<Text
					level="h1"
					as="p"
					className="text-primary-800 font-normal max-w-3xl"
				>
					Cultivando sabedoria e compartilhando experiências para agroecologizar
					o mundo
				</Text>
			</section>
			{featured_vegetables && featured_vegetables.length > 0 && (
				<section className="overflow-x-auto flex gap-x-9 gap-y-7 mt-3 px-pageX">
					{featured_vegetables.map((vegetable) => (
						<VegetableCard key={vegetable.id} vegetable={vegetable} />
					))}
				</section>
			)}
			{profiles && profiles.length > 0 && (
				<section className="my-36">
					<SectionTitle Icon={SeedlingIcon}>Quem se envolve</SectionTitle>
					<div className="flex overflow-auto gap-12 mt-3 px-pageX">
						{profiles.map((profile) => (
							<UserAvatar key={profile.handle} user={profile} size="lg" />
						))}
					</div>
				</section>
			)}
		</>
	)
}
