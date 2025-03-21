import SuggestionsGrid from '@/components/SuggestionsGrid'
import { Text } from '@/components/ui/text'
import { client } from '@/gel'
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

export default async function PendingSuggestionsIndex() {
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
    <main className="px-pageX py-pageY">
      <Text level="h1" as="h1">
        Sugestões em aberto
      </Text>
      <div className="mt-6 flex flex-wrap gap-3">
        {pendingSuggestions.length === 0 && (
          <Text level="p">
            Não há sugestões precisando de revisão. Tudo certin ✨
          </Text>
        )}
        <SuggestionsGrid suggestions={pendingSuggestions} />
      </div>
    </main>
  )
}
