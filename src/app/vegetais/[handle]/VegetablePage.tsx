import { SanityImage } from '@/components/SanityImage'
import SectionTitle from '@/components/SectionTitle'
import VegetableCard from '@/components/VegetableCard'
import BulbIcon from '@/components/icons/BulbIcon'
import PotIcon from '@/components/icons/PotIcon'
import RainbowIcon from '@/components/icons/RainbowIcon'
import SeedlingIcon from '@/components/icons/SeedlingIcon'
import ShovelIcon from '@/components/icons/ShovelIcon'
import VegetableFriendsIcon from '@/components/icons/VegetableFriendsIcon'
import TipTapRenderer from '@/components/tiptap/DefaultTipTapRenderer'
import { Text } from '@/components/ui/text'
import type { VegetablePageData } from '@/queries'
import { RichText } from '@/schemas'
import { gender } from '@/utils/strings'
import * as S from '@effect/schema/Schema'
import { VegetablePageHero } from './VegetablePageHero'
import VegetablePageSidebar from './VegetablePageSidebar'
import VegetableTips from './VegetableTips'

export default function VegetablePage({
	vegetable,
}: {
	vegetable: VegetablePageData
}) {
	const { names = [] } = vegetable

	const friends = vegetable.friends || []
	return (
		<main className="py-12">
			<div className="flex gap-[4.5rem] px-pageX" id="visao-geral">
				<VegetablePageHero vegetable={vegetable} />
				<VegetablePageSidebar vegetable={vegetable} />
			</div>
			{vegetable.tips && vegetable.tips.length > 1 && (
				<>
					<section className="my-36" id="sugestoes">
						<SectionTitle Icon={ShovelIcon}>Sugestões e dicas</SectionTitle>
						<VegetableTips vegetable={vegetable} />
					</section>
				</>
			)}
			{Array.isArray(vegetable.varieties) && vegetable.varieties.length > 0 && (
				<section className="my-36" id="variedades">
					<SectionTitle Icon={RainbowIcon}>Variedades</SectionTitle>
					<div className="overflow-x-auto flex gap-20 mt-3 px-pageX">
						{vegetable.varieties.map((variety) => {
							if (!variety.names || variety.names.length === 0) return null

							return (
								<div key={variety.handle} className="flex gap-5 items-center">
									{Array.isArray(variety.photos) &&
										variety.photos[0]?.sanity_id && (
											<SanityImage
												image={variety.photos[0]}
												maxWidth={200}
												className="w-auto flex-0 max-h-[12.5rem] max-w-[12.5rem] object-cover rounded-lg"
											/>
										)}
									<div>
										<Text level="h3" weight="normal">
											{variety.names[0]}
										</Text>
										{variety.names.length > 1 && (
											<Text level="p">{variety.names.slice(1).join(', ')}</Text>
										)}
									</div>
								</div>
							)
						})}
					</div>
				</section>
			)}
			{S.is(RichText)(vegetable.content) && (
				<section className="my-36" id="curiosidades">
					<SectionTitle Icon={BulbIcon}>
						Sobre {gender.article(vegetable.gender || 'NEUTRO', 'both')}
						{names[0]}
					</SectionTitle>
					<div className="px-pageX text-base max-w-[39.375rem] box-content mt-5 space-y-3">
						<TipTapRenderer content={vegetable.content} />
					</div>
				</section>
			)}
			{friends.length > 0 && (
				<section className="my-36" id="amizades">
					<SectionTitle Icon={VegetableFriendsIcon}>
						Amigues d{gender.suffix(vegetable.gender || 'NEUTRO')} {names[0]}
					</SectionTitle>
					<div className="overflow-x-auto flex gap-x-9 gap-y-7 mt-3 px-pageX hide-scrollbar">
						{friends.map((friend) => (
							<VegetableCard key={friend.handle} vegetable={friend} />
						))}
					</div>
				</section>
			)}
			{/* @TODO */}
			{false && (
				<>
					<section className="my-36">
						<SectionTitle Icon={SeedlingIcon}>Quem já planta</SectionTitle>
					</section>
					<section className="my-36">
						<SectionTitle Icon={PotIcon}>
							Aprendizados e experimentos
						</SectionTitle>
					</section>
				</>
			)}
		</main>
	)
}
