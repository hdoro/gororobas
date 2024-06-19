import type { VegetableCardData } from '@/queries'
import type { PropsWithChildren } from 'react'
import VegetableCard from './VegetableCard'

export default function VegetablesStrip(
	props: PropsWithChildren<{
		vegetables: VegetableCardData[]
		offset?: boolean
	}>,
) {
	return (
		<div className="flex justify-center vegetables-strip--wrapper">
			<div className="flex justify-center gap-9 overflow-visible w-auto hide-scrollbar vegetables-strip">
				{props.vegetables.map((vegetable) => (
					<VegetableCard
						key={vegetable.handle}
						vegetable={vegetable}
						fixedWidth
					/>
				))}
			</div>
		</div>
	)
}
