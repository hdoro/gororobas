'use client'

import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { Badge } from '@/components/ui/badge'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from '@/components/ui/carousel'
import type { VegetableCardData } from '@/queries'
import { use, useCallback, useEffect, useState } from 'react'
import { SanityImage } from './SanityImage'
import { cn } from '@/utils/cn'
import Link from 'next/link'
import { paths } from '@/utils/urls'

export default function VegetableCard({
	vegetable,
}: { vegetable: VegetableCardData }) {
	const { photos = [] } = vegetable

	return (
		<Link
			href={paths.vegetable(vegetable.handle)}
			className="relative overflow-hidden rounded-lg flex-1 aspect-[1.15] w-auto h-auto max-w-[15.625rem] group"
			draggable={false}
		>
			{photos.length > 0 ? (
				<CardWithPhotoContents vegetable={vegetable} />
			) : (
				<div className="bg-stone-200 h-full w-full flex justify-center items-center">
					<span>{vegetable.name}</span>
				</div>
			)}
		</Link>
	)
}

function CardWithPhotoContents({
	vegetable,
}: { vegetable: VegetableCardData }) {
	const { photos = [] } = vegetable
	const [api, setApi] = useState<CarouselApi>()
	const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0)

	const onSelect = useCallback(() => {
		if (!api) return
		setSelectedSlideIndex(api.selectedScrollSnap())
	}, [api])

	useEffect(() => {
		if (!api) {
			return
		}
		onSelect()

		api.on('select', onSelect).on('reInit', onSelect)
	}, [api, onSelect])

	return (
		<>
			<Badge className="absolute left-2 top-2 max-w-3/4 z-20" variant="outline">
				{vegetable.name}
			</Badge>
			{photos.length > 1 && (
				<>
					<Carousel
						className={'h-full w-full'}
						opts={{
							loop: true,
							duration: 15,
						}}
						setApi={setApi}
						plugins={[WheelGesturesPlugin()]}
					>
						<CarouselContent className="h-full" rootClassName="h-full">
							{photos.map((photo, idx) => {
								return (
									<CarouselItem
										key={photo.sanity_id || idx}
										className="relative flex justify-center bg-stone-200 h-full"
									>
										<SanityImage
											image={photo}
											maxWidth={250}
											className={
												'block h-full w-full object-cover select-none group-hover:scale-105 !transition-all'
											}
											draggable={false}
										/>
									</CarouselItem>
								)
							})}
						</CarouselContent>
						<div
							className="absolute z-20 inset-x-0 bottom-0 pb-2 pt-3 flex gap-1.5 justify-center"
							style={{
								background:
									'linear-gradient(180deg, rgba(64, 121, 75, 0) 0%, rgba(45, 78, 52) 105%)',
							}}
						>
							{photos.map((photo, index) => (
								<div
									key={photo.sanity_id}
									aria-hidden
									className={cn(
										'h-1.5 w-1.5 rounded-full',
										index === selectedSlideIndex
											? 'bg-primary-50'
											: 'bg-primary-200',
									)}
								/>
							))}
						</div>
						<CarouselPrevious className="z-30 absolute top-1/2 -translate-y-1/2 left-2 transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" />
						<CarouselNext className="z-30 absolute top-1/2 -translate-y-1/2 right-2 transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" />
					</Carousel>
				</>
			)}
			{photos.length === 1 && (
				<SanityImage
					image={photos[0]}
					maxWidth={250}
					className={
						'block h-full w-full object-cover group-hover:scale-105 !transition-all'
					}
					draggable={false}
				/>
			)}
		</>
	)
}
