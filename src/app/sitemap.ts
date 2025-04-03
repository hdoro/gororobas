import {
  notesForSitemapQuery,
  resourcesForSitemapQuery,
  vegetablesForSitemapQuery,
} from '@/queries'
import { runQuery } from '@/services/runQuery'
import { runServerEffect } from '@/services/runtime'
import { paths, pathToAbsUrl } from '@/utils/urls'
import { Effect, pipe } from 'effect'
import type { MetadataRoute } from 'next'

const SITEMAP_TYPES = [
  { id: 'indice' },
  { id: 'vegetais' },
  { id: 'notas' },
  { id: 'biblioteca' },
] as const

type SitemapType = (typeof SITEMAP_TYPES)[number]['id']

export function generateSitemaps() {
  return SITEMAP_TYPES
}

const sitemapRoutes = {
  vegetais: {
    query: vegetablesForSitemapQuery,
    getPath: (handle: string) => paths.vegetable(handle),
  },
  notas: {
    query: notesForSitemapQuery,
    getPath: (handle: string) => paths.note(handle),
  },
  biblioteca: {
    query: resourcesForSitemapQuery,
    getPath: (handle: string) => paths.resource(handle),
  },
} as const

export default async function sitemap({
  id,
}: {
  id: SitemapType
}): Promise<MetadataRoute.Sitemap> {
  if (id === 'indice') {
    return [
      {
        url: pathToAbsUrl('', true),
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      ...SITEMAP_TYPES.filter(({ id }) => id !== 'indice').map(({ id }) => ({
        url: pathToAbsUrl(`/sitemap/${id}.xml`, true),
      })),
    ]
  }

  const handler = sitemapRoutes[id]
  if (!handler) {
    return []
  }

  const entries = await runServerEffect(
    pipe(
      runQuery(handler.query, undefined, {
        metricsName: `sitemap_${id.toLowerCase()}`,
      }),
      Effect.tapError((error) => Effect.logError(error)),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )

  return (entries || []).map((entry) => ({
    url: pathToAbsUrl(handler.getPath(entry.handle), true),
    lastModified: entry.updated_at ? new Date(entry.updated_at) : undefined,
    priority: 0.7,
  }))
}
