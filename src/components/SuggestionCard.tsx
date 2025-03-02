import type { EditSuggestionCardData } from '@/queries'
import { paths } from '@/utils/urls'
import { type Changeset, atomizeChangeset } from 'json-diff-ts'
import Link from 'next/link'
import ProfileCard from './ProfileCard'
import { SanityImage } from './SanityImage'
import { Text } from './ui/text'

export default function SuggestionCard({
  suggestion,
}: {
  suggestion: EditSuggestionCardData
}) {
  const atomized = atomizeChangeset(suggestion.diff as Changeset)
  return (
    <Link
      key={suggestion.id}
      href={paths.editSuggestion(suggestion.id)}
      className="group bg-background-card hover:border-primary-400 block space-y-2 rounded-md border p-3 transition-all hover:bg-white/80"
    >
      {suggestion.target_object?.name && (
        <div className="flex items-center gap-2">
          {suggestion.target_object.photos.length > 0 && (
            <SanityImage
              image={suggestion.target_object.photos[0]}
              maxWidth={48}
              className="h-12 w-12 rounded-md object-cover"
            />
          )}
          <Text
            level="sm"
            className="text-muted-foreground group-hover:text-foreground"
          >
            {suggestion.target_object.name}
          </Text>
        </div>
      )}
      <Text level="sm" className="text-muted-foreground">
        {atomized.length} mudança{atomized.length > 1 ? 's' : ''}{' '}
        {suggestion.created_at && (
          <>
            em{' '}
            {suggestion.created_at.toLocaleDateString('pt-BR', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
            })}
          </>
        )}
      </Text>
      {suggestion.created_by && (
        <ProfileCard profile={suggestion.created_by} linkToProfile={false} />
      )}
    </Link>
  )
}
