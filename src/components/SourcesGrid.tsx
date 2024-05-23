import type { SourceCardData } from '@/queries'
import { cn } from '@/utils/cn'
import type {
	DetailedHTMLProps,
	HTMLAttributes,
	PropsWithChildren,
} from 'react'
import SourceCard from './SourceCard'

export function SourcesGridWrapper(
	props: PropsWithChildren<
		DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
	>,
) {
	return (
		<div
			{...props}
			className={cn('flex flex-wrap gap-4', props.className)}
			style={{
				...(props.style || {}),
				gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
			}}
		>
			{props.children}
		</div>
	)
}

export default function SourcesGrid({
	sources,
	...props
}: { sources: SourceCardData[] } & DetailedHTMLProps<
	HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
>) {
	if (!sources || sources.length === 0) return null

	return (
		<SourcesGridWrapper {...props}>
			{sources.map((source) => (
				<SourceCard key={source.id} source={source} />
			))}
		</SourcesGridWrapper>
	)
}
