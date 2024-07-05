import type { EditSuggestionCardData } from '@/queries'
import { cn } from '@/utils/cn'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'
import SuggestionCard from './SuggestionCard'

export default function SuggestionsGrid({
	suggestions,
	...props
}: { suggestions: EditSuggestionCardData[] } & DetailedHTMLProps<
	HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
>) {
	if (!suggestions || suggestions.length === 0) return null

	return (
		<div
			{...props}
			className={cn(
				'grid gap-3 grid-cols-[repeat(auto-fill,_minmax(15rem,_1fr))]',
				props.className,
			)}
		>
			{suggestions.map((suggestion) => (
				<SuggestionCard key={suggestion.id} suggestion={suggestion} />
			))}
		</div>
	)
}
