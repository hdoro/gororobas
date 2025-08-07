import type { DetailedHTMLProps, HTMLAttributes } from 'react'
import type { EditSuggestionCardData } from '@/queries'
import { cn } from '@/utils/cn'
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
        'grid max-w-full grid-cols-[repeat(auto-fill,minmax(min(20rem,100%),1fr))] gap-3',
        props.className,
      )}
    >
      {suggestions.map((suggestion) => (
        <SuggestionCard key={suggestion.id} suggestion={suggestion} />
      ))}
    </div>
  )
}
