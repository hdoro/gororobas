import { SanityImage } from '@/components/SanityImage'
import TipTapRenderer from '@/components/TipTapRenderer'
import BulbIcon from '@/components/icons/BulbIcon'
import PotIcon from '@/components/icons/PotIcon'
import RainbowIcon from '@/components/icons/RainbowIcon'
import SeedlingIcon from '@/components/icons/SeedlingIcon'
import ShapesIcon from '@/components/icons/ShapesIcon'
import ShovelIcon from '@/components/icons/ShovelIcon'
import { Badge } from '@/components/ui/badge'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel'
import { Text } from '@/components/ui/text'
import type { VegetablePageData } from '@/queries'
import { RichText } from '@/schemas'
import { getImageDimensions } from '@/utils/getImageProps'
import {
	EDIBLE_PART_TO_LABEL,
	PLANTING_METHOD_TO_LABEL,
	STRATUM_TO_LABEL,
	USAGE_TO_LABEL,
	VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { average } from '@/utils/numbers'
import { gender } from '@/utils/strings'
import * as S from '@effect/schema/Schema'
import {
	Fragment,
	type PropsWithChildren,
	type SVGProps,
	Suspense,
} from 'react'
import VegetableTips from './VegetableTips'
import WishlistButtonData from './WishlistButtonData'

function TwoColInfo({
	left,
	right,
}: {
	left: string
	right: string | string[]
}) {
	if (!right || (Array.isArray(right) && right.length === 0)) return null

	return (
		<div className="flex gap-5 items-start leading-normal">
			<Text as="h2" weight="semibold" className="flex-1 max-w-[12.5rem]">
				{left}
			</Text>
			<Text
				className="flex-1 flex wrap gap-2"
				as={Array.isArray(right) ? 'div' : 'p'}
			>
				{Array.isArray(right) &&
					right.map((item, i) => {
						if (!item) return null
						return (
							// biome-ignore lint: we need to use the index to account for empty paragraphs
							<Badge key={item + i} variant="secondary">
								{item}
							</Badge>
						)
					})}
				{typeof right === 'string' && (
					<>
						{right.split('\n').map((paragraph, idx, arr) => (
							// biome-ignore lint: we need to use the index to account for empty paragraphs
							<Fragment key={paragraph + idx}>
								{paragraph}
								{idx < arr.length - 1 && <br />}
							</Fragment>
						))}
					</>
				)}
			</Text>
		</div>
	)
}

function SectionTitle({
	children,
	Icon,
}: PropsWithChildren<{
	Icon?: (
		props: SVGProps<SVGSVGElement> & {
			variant: 'color' | 'monochrome'
		},
	) => JSX.Element
}>) {
	return (
		<Text
			level="h2"
			className="max-w-[73.125rem] m-auto flex gap-2.5 items-center"
		>
			{Icon && <Icon variant="color" className="w-8" />}
			{children}
		</Text>
	)
}

export default function VegetablePage({
	vegetable,
}: {
	vegetable: VegetablePageData
}) {
	const mainImage = vegetable.photos?.[0]
	const { names = [], scientific_names = [] } = vegetable

	// @TODO render credits
	const carouselPhotos = [
		...(vegetable.photos || []).slice(1),
		...(vegetable.varieties || []).flatMap((v) => v.photos || []),
	].flatMap((p) => (p.sanity_id ? p : []))

	const aspectRatios = [mainImage, ...carouselPhotos].flatMap(
		(image) => (image && getImageDimensions(image)?.aspectRatio) || [],
	)
	const averageAspectRatio = average(aspectRatios)

	return (
		<main className="py-12">
			<div className="flex gap-[4.5rem] max-w-[73.125rem] mx-auto px-20 box-content">
				<div className="flex-1 max-w-[53.125rem]">
					<div className="flex gap-5 items-end justify-between">
						<div>
							<Text level="h1" as="h1">
								{names[0]}
							</Text>
							{scientific_names?.[0] && (
								<Text level="h2" weight="normal" className="italic">
									{scientific_names[0]}
								</Text>
							)}
						</div>
						<Suspense>
							<WishlistButtonData vegetable_id={vegetable.id} />
						</Suspense>
					</div>

					{vegetable.photos && mainImage?.sanity_id && (
						<div
							className="flex flex-col lg:flex-row gap-5 mt-5 overflow-hidden"
							style={{
								'--max-height': `${Math.round(20 / averageAspectRatio)}rem`,
							}}
						>
							<div className="flex-1 max-w-80 rounded-2xl object-cover relative z-10 max-h-[var(--max-height)]">
								<SanityImage
									image={mainImage}
									maxWidth={320}
									className="h-full w-full rounded-2xl object-cover relative z-10 max-h-[var(--max-height)]"
									fetchPriority="high"
									loading="eager"
								/>
								{/* Hides the left-most piece of the carousel images to fully show the main image's border */}
								<div
									aria-hidden
									className="bg-white absolute left-0 top-0 h-full w-6"
								/>
							</div>
							{carouselPhotos.length > 0 && (
								<Carousel
									className={'flex-1 max-h-[var(--max-height)]'}
									opts={{
										loop: true,
									}}
								>
									<CarouselContent className="ml-0 space-x-5" rootClassName="">
										{carouselPhotos.map((photo, idx) => {
											return (
												<CarouselItem
													key={photo.sanity_id || idx}
													className="relative flex justify-center bg-gray-200 pl-0 overflow-hidden rounded-2xl"
												>
													<SanityImage
														image={photo}
														maxWidth={520}
														className={
															'h-full w-auto object-contain object-center max-h-[var(--max-height)]'
														}
													/>
													{photo.label && (
														<Badge
															className="absolute left-4 bottom-4"
															variant="outline"
														>
															{photo.label}
														</Badge>
													)}
												</CarouselItem>
											)
										})}
									</CarouselContent>
									<div className="absolute right-4 bottom-4 flex gap-2.5 items-center">
										<CarouselPrevious className="relative translate-x-0 translate-y-0 left-0 top-0 bg-white" />
										<CarouselNext className="relative translate-x-0 translate-y-0 left-0 top-0 bg-white" />
									</div>
								</Carousel>
							)}
						</div>
					)}

					<div className="space-y-8 mt-10">
						{names.length > 1 && (
							<TwoColInfo
								left={`Também conhecid${gender.suffix(
									vegetable.gender || 'MASCULINO',
								)} como`}
								right={names.slice(1).join(', ')}
							/>
						)}
						{vegetable.origin && (
							<TwoColInfo left={'Origem'} right={vegetable.origin} />
						)}
						{vegetable.uses && (
							<TwoColInfo
								left={'Principais usos'}
								right={vegetable.uses.map((u) => USAGE_TO_LABEL[u])}
							/>
						)}
						{vegetable.edible_parts && (
							<TwoColInfo
								left={'Partes comestíveis'}
								right={vegetable.edible_parts.map(
									(u) => EDIBLE_PART_TO_LABEL[u],
								)}
							/>
						)}
						{vegetable.strata && (
							<TwoColInfo
								left={'Estrato'}
								right={vegetable.strata.map((u) => STRATUM_TO_LABEL[u])}
							/>
						)}
						{vegetable.lifecycles && (
							<TwoColInfo
								left={'Ciclo de vida'}
								right={vegetable.lifecycles.map(
									(u) => VEGETABLE_LIFECYCLE_TO_LABEL[u],
								)}
							/>
						)}
						{vegetable.planting_methods && (
							<TwoColInfo
								left={'Métodos de plantio e propagação'}
								right={vegetable.planting_methods.map(
									(u) => PLANTING_METHOD_TO_LABEL[u],
								)}
							/>
						)}
					</div>
				</div>
			</div>
			{vegetable.tips && vegetable.tips.length > 1 && (
				<>
					<section className="my-36">
						<SectionTitle Icon={ShovelIcon}>Sugestões e dicas</SectionTitle>
						<VegetableTips vegetable={vegetable} />
					</section>
				</>
			)}
			{Array.isArray(vegetable.varieties) && vegetable.varieties.length > 0 && (
				<section className="my-36">
					<SectionTitle Icon={RainbowIcon}>Variedades</SectionTitle>
					<div className="overflow-x-auto flex gap-20 mt-3 px-[calc(calc(100vw-73.125rem)/2)]">
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
				<section className="my-36 max-w-[73.125rem] mx-auto">
					<SectionTitle Icon={BulbIcon}>
						Sobre {gender.article(vegetable.gender || 'NEUTRO', 'both')}
						{names[0]}
					</SectionTitle>
					<div className="text-base max-w-[39.375rem] mt-5 space-y-3">
						<TipTapRenderer content={vegetable.content} />
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
						<SectionTitle Icon={ShapesIcon}>Consórcios</SectionTitle>
					</section>
					<section className="my-36">
						<SectionTitle Icon={PotIcon}>Receitas</SectionTitle>
					</section>
				</>
			)}
		</main>
	)
}
