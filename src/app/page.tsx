import HomePage from '@/components/HomePage'
import JsonLD from '@/components/JsonLD'
import { client } from '@/gel'
import { homePageQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { shuffleArray } from '@/utils/arrays'
import { pathToAbsUrl } from '@/utils/urls'
import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gororobas - Território Digital de Agroecologia',
  description:
    'Enciclopédia colaborativa de conhecimento em agroecologia sobre mais de 400 vegetais',
  alternates: {
    canonical: pathToAbsUrl('', true),
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Gororobas Agroecologia',
  description:
    'O Gororobas sonha ser um território digital de encontro entre arquipélagos dos seres em transição agroecológica, compartilhando conhecimento territorializado sobre plantar, cozinhar e compartilhar o alimento, o cuidado, a luta, e a terra. Um espaço para encantar e esperançar como um verbo, mobilizando a ação.',
  email: 'ola@gororobas.com',
  logo: pathToAbsUrl('/logo-full.svg', true),
  url: pathToAbsUrl('', true),
  sameAs: 'https://bsky.app/profile/gororobas.com',
} as const

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
