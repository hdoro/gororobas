'use server'

import { auth } from '@/edgedb'
import { updateProfileMutation, upsertSourcesMutation } from '@/mutations'
import { ProfileDataWithImage } from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import {
  sourcesToParam,
  upsertImagesInTransaction,
} from '@/utils/mutation.utils'
import type { Client } from 'edgedb'
import { Schema } from 'effect'
import { Effect, pipe } from 'effect'

export async function updateProfileAction(
  input: typeof ProfileDataWithImage.Type,
) {
  const session = auth.getSession()

  if (!Schema.is(ProfileDataWithImage)(input))
    return {
      error: 'invalid-input',
    } as const

  return runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => getTransaction(input, session.client),
        catch: (error) => {
          console.log('Failed updating profile', error)
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
