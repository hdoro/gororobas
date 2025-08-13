import { Effect, pipe } from 'effect'
import SparklesIcon from '@/components/icons/SparklesIcon'
import SectionTitle from '@/components/SectionTitle'
import SourcesGrid from '@/components/SourcesGrid'
import SuggestionsGrid from '@/components/SuggestionsGrid'
import { Text } from '@/components/ui/text'
import { client } from '@/gel'
import { m } from '@/paraglide/messages'
import {
  editHistoryQuery,
  type SourceCardData,
  type VegetablePageData,
} from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { generateId } from '@/utils/ids'

const fetchEditHistory = (vegetable_id: string) =>
  pipe(
    Effect.tryPromise({
      try: () =>
        editHistoryQuery.run(
          client.withConfig({
            // Edit suggestions aren't public - we only allow reading them from the vegetable page so we can render the user list
            apply_access_policies: false,
          }),
          {
            vegetable_id,
          },
        ),
      catch: (error) => console.log(error),
    }),
    ...buildTraceAndMetrics('edit_history', { vegetable_id }),
    Effect.catchAll(() => Effect.succeed(null)),
  )

export default async function VegetableContributors({
  vegetable,
}: {
  vegetable: VegetablePageData
}) {
  const acceptedSuggestions = await runServerEffect(
    fetchEditHistory(vegetable.id),
  )

  const allSources = [
    ...(vegetable.photos || []).flatMap((photo) => photo?.sources || []),
    ...(vegetable.varieties || []).flatMap(
      (variety) =>
        variety?.photos?.flatMap((photo) => photo?.sources || []) || [],
    ),
    ...(acceptedSuggestions || []).flatMap((suggestion) => {
      if (!suggestion.created_by) return []

      return {
        id: generateId(),
        type: 'GOROROBAS',
        users: [{ ...suggestion.created_by, id: generateId() }],
        credits: null,
        origin: null,
        comments: null,
      } satisfies SourceCardData
    }),
  ]
  const internalSources = allSources.flatMap((source, index) => {
    if (source?.type !== 'GOROROBAS') return []

    return {
      ...source,
      // de-duplicate users that show up in multiple sources
      users: source.users.filter(
        (user) =>
          !allSources
            .slice(index + 1)
            .some(
              (s) =>
                s.type === 'GOROROBAS' &&
                s.users.some((u) => u.handle === user.handle),
            ),
      ),
    }
  })

  if (
    (!acceptedSuggestions || acceptedSuggestions.length === 0) &&
    internalSources.length === 0
  ) {
    return null
  }

  return (
    <section className="my-36" id="contribuintes">
      <SectionTitle Icon={SparklesIcon}>
        {m.nice_topical_dolphin_hike()}
      </SectionTitle>
      <div className="px-pageX">
        <Text level="h3" className="font-normal">
          {m.tidy_quiet_cow_clasp()}
        </Text>
        <SourcesGrid sources={internalSources} className="mt-3 flex-1 gap-8" />
        {acceptedSuggestions && acceptedSuggestions.length > 0 && (
          <div className="bg-background-card mt-6 space-y-3 rounded-md border-2 px-6 py-4">
            <Text as="h3">
              {m.watery_born_duck_view({
                gender: vegetable.gender || 'NEUTRO',
                name: vegetable.names[0],
              })}
            </Text>

            <SuggestionsGrid suggestions={acceptedSuggestions} />
          </div>
        )}
      </div>
    </section>
  )
}
