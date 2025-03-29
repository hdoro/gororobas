import { type ResourcePageData, resourcePageQuery } from '@/queries'
import { runQuery } from '@/services/runQuery'
import { runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ResourcePage from './ResourcePage'
import getResourceMetadata from './getResourceMetadata'

function getRouteData(handle: string) {
  return runServerEffect(
    pipe(
      runQuery(
        resourcePageQuery,
        { handle },
        { metricsName: 'resource_page', metricsData: { handle } },
      ),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  ) as unknown as ResourcePageData | null
}

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const params = await props.params
  return getResourceMetadata(await getRouteData(params.handle))
}

export default async function ResourceRoute(props: {
  params: Promise<{ handle: string }>
}) {
  const params = await props.params

  const { handle } = params

  const resource = await getRouteData(handle)

  if (!resource) return notFound()

  return <ResourcePage resource={resource as ResourcePageData} />
}
