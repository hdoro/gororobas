'use server'

import { getMentionsDataQuery } from '@/queries'
import { runQuery } from '@/services/runQuery'
import { runServerEffect } from '@/services/runtime'
import type { ImageForRendering } from '@/types'
import { Effect, Schema, pipe } from 'effect'
import type { FreshMentionData } from './getMentionsData'

export async function getMentionsDataAction(rawIds: readonly string[]) {
  const ids = [...new Set(rawIds)].filter((id) => Schema.is(Schema.UUID)(id))

  return runServerEffect(
    pipe(
      runQuery(
        getMentionsDataQuery,
        { ids },
        {
          metricsName: 'get_mentions_data',
          metricsData: { id_count: ids.length },
        },
      ),
      Effect.map((mentions) =>
        mentions.flatMap((data) => {
          let label: string | null = null
          let image: ImageForRendering | null = null
          let objectType: FreshMentionData['objectType'] | null = null

          if (data.__typename === 'default::UserProfile') {
            label = data.name
            image = data.photo
            objectType = 'UserProfile'
          }

          if (data.__typename === 'default::Vegetable') {
            label = data.names[0]
            image = data.photos[0]
            objectType = 'Vegetable'
          }

          if (!label || !objectType) return []

          return {
            id: data.id,
            handle: data.handle,
            objectType,
            label,
            image,
          } satisfies FreshMentionData
        }),
      ),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )
}
