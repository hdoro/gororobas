import SuggestionCard from '@/components/SuggestionCard'
import { Text } from '@/components/ui/text'
import { client } from '@/edgedb'
import { pendingSuggestionsIndexQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Sugestões em aberto | Gororobas',
	robots: {
		index: false,
		follow: false,
	},
}

export default async function PendingSuggestionsIndex(props: {
	vegetable_id: string
}) {
	const pendingSuggestions = await runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => pendingSuggestionsIndexQuery.run(client),
				catch: (error) => console.log(error),
			}),
			...buildTraceAndMetrics('pending_suggestions'),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)

	if (!pendingSuggestions) {
		notFound()
	}

	return (
		<main className="py-pageY px-pageX">
			<Text level="h1" as="h1">
				Sugestões em aberto
			</Text>
			<div className="flex flex-wrap gap-3 mt-6">
				{pendingSuggestions.map((suggestion) => (
					<SuggestionCard key={suggestion.id} suggestion={suggestion} />
				))}
			</div>
		</main>
	)
}
