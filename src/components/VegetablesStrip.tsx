import type { VegetableCardData } from '@/queries'
import type { PropsWithChildren } from 'react'
import VegetableCard from './VegetableCard'

/**
 * Not actually auto-scrolling 😅
 *
 * I'm worried about performance, so skipping the auto-scrolling as much as I'd like to see it happen.
 */
export default function VegetablesStrip(
	props: PropsWithChildren<{
		vegetables: VegetableCardData[]
		offset?: boolean
	}>,
) {
	return (
		<div
			className="flex justify-center gap-9 overflow-auto w-auto mx-auto hide-scrollbar"
			style={{
				paddingLeft: props.offset
					? 'calc(var(--vegetable-card-width) + 2.25rem)'
					: undefined,
			}}
		>
			{props.vegetables.map((vegetable) => (
				<VegetableCard
					key={vegetable.handle}
					vegetable={vegetable}
					fixedWidth
				/>
			))}
		</div>
	)
}
