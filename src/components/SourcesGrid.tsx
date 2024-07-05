import type { SourceCardData } from '@/queries'
import { cn } from '@/utils/cn'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'
import SourceCard from './SourceCard'

export default function SourcesGrid({
	sources,
	...props
}: { sources: SourceCardData[] } & DetailedHTMLProps<
	HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
>) {
	if (!sources || sources.length === 0) return null

	return (
		<div
			{...props}
			className={cn('flex flex-wrap gap-4', props.className)}
			style={{
				...(props.style || {}),
				gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
			}}
		>
			{sources.map((source) => (
				<SourceCard key={source.id} source={source} />
			))}
		</div>
	)
}
