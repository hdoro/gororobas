import type { VegetableVarietyCardData } from '@/queries'
import { SanityImage } from './SanityImage'
import { Text } from './ui/text'

export default function VegetableVarietyCard({
	variety,
}: { variety: VegetableVarietyCardData }) {
	if (!variety.names || variety.names.length === 0) return null

	return (
		<div key={variety.handle} className="flex gap-5 items-center">
			{Array.isArray(variety.photos) && variety.photos[0]?.sanity_id && (
				<SanityImage
					image={variety.photos[0]}
					maxWidth={200}
					className="w-auto flex-0 max-h-[12.5rem] max-w-[12.5rem] object-cover rounded-lg"
				/>
			)}
			<div
				style={{
					minWidth: `${variety.names[0].length / 2}ch`,
				}}
			>
				<Text level="h3" weight="normal">
					{variety.names[0]}
				</Text>
				{variety.names.length > 1 && (
					<Text level="p">{variety.names.slice(1).join(', ')}</Text>
				)}
			</div>
		</div>
	)
}
