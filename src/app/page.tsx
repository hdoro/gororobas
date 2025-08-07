import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import HomePage from '@/components/HomePage'
import JsonLD from '@/components/JsonLD'
import { client } from '@/gel'
import { m } from '@/paraglide/messages'
import { homePageQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { shuffleArray } from '@/utils/arrays'
import { pathToAbsUrl } from '@/utils/urls'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: m.fair_clear_shrimp_flow(),
    description: m.lazy_salty_kitten_cuddle(),
    alternates: {
      canonical: pathToAbsUrl('', true),
    },
  }
}

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: m.fresh_new_panther_quiz(),
    description: m.zesty_zany_felix_flow(),
    email: m.gororobas_email(),
    logo: pathToAbsUrl('/logo-full.svg', true),
    url: pathToAbsUrl('', true),
    sameAs: 'https://bsky.app/profile/gororobas.com',
  } as const

  return (
    <>
      <HomePage
        {...(data || {})}
        notes={shuffleArray(data.notes).slice(0, 3)}
        recent_contributions={shuffleArray(data.recent_contributions).slice(
          0,
          3,
        )}
        profiles={shuffleArray(data.profiles).slice(0, 6)}
      />
      <JsonLD data={jsonLd} />
    </>
  )
}
