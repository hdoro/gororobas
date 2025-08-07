'use server'

import { Effect, pipe, Schema } from 'effect'
import type { Client } from 'gel'
import { auth } from '@/gel'
import { updateProfileMutation, upsertSourcesMutation } from '@/mutations'
import { ProfileDataWithImage } from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import {
  sourcesToParam,
  upsertImagesInTransaction,
} from '@/utils/mutation.utils'

export async function updateProfileAction(
  input: typeof ProfileDataWithImage.Type,
) {
  const session = await auth.getSession()

  if (!Schema.is(ProfileDataWithImage)(input))
    return {
      error: 'invalid-input',
    } as const

  return runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => getTransaction(input, session.client),
        catch: (error) => {
          console.log('[updateProfileAction] failed updating profile', error)
        },
      }),
      Effect.map(() => true),
      ...buildTraceAndMetrics('edit_profile'),
      Effect.catchAll(() =>
        Effect.succeed({ error: 'unknown-error' } as const),
      ),
    ),
  )
}

function getTransaction(
  input: typeof ProfileDataWithImage.Type,
  inputClient: Client,
) {
  const client = inputClient.withConfig({ allow_user_specified_id: true })

  return client.transaction(async (tx) => {
    // #1 CREATE IMAGE'S SOURCE, IF ANY
    const allSources = input.photo?.sources || []
    if (allSources.length > 0) {
      await upsertSourcesMutation.run(tx, sourcesToParam(allSources))
    }

    // #2 CREATE THE IMAGE OBJECT
    const photosIdMap = await upsertImagesInTransaction(
      input.photo ? [input.photo] : [],
      tx,
    )

    // #3 UPDATE PROFILE
    await updateProfileMutation.run(tx, {
      bio: input.bio ?? null,
      handle: input.handle ?? null,
      location: input.location ?? null,
      name: input.name ?? null,
      photo: input.photo ? photosIdMap[input.photo.id] : null,
    })
  })
}
