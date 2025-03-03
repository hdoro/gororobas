import HomePage from '@/components/HomePage'
import { client } from '@/gel'
import { homePageQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { shuffleArray } from '@/utils/arrays'
import { Effect, pipe } from 'effect'

export default async function Home() {
  const data = await runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => homePageQuery.run(client),
        catch: (error) => console.log(error),
      }),
      ...buildTraceAndMetrics('home_page'),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )

  if (!data) {
    return null
  }

  return (
    <HomePage
      {...(data || {})}
      notes={shuffleArray(data.notes).slice(0, 3)}
      recent_contributions={shuffleArray(data.recent_contributions).slice(0, 3)}
      profiles={shuffleArray(data.profiles).slice(0, 6)}
    />
  )
}
