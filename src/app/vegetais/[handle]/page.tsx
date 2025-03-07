import { vegetablePageQuery } from '@/queries'
import { runQuery } from '@/services/runQuery'
import { runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import VegetablePage from './VegetablePage'
import getVegetableMetadata from './getVegetableMetadata'

function getRouteData(handle: string) {
  return runServerEffect(
    pipe(
      runQuery(
        vegetablePageQuery,
        { handle },
        { metricsName: 'vegetable_page', metricsData: { handle } },
      ),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )
}

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const params = await props.params
  return getVegetableMetadata(await getRouteData(params.handle))
}

export default async function VegetableRoute(props: {
  params: Promise<{ handle: string }>
}) {
  const params = await props.params

  const { handle } = params

  const vegetable = await getRouteData(handle)

  if (!vegetable) return notFound()

  return <VegetablePage vegetable={vegetable} />
}
