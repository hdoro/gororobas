import { FailedUploadingImageError } from '@/types/errors'
import { sanityServerClient } from '@/utils/sanity.client'
import { Effect, pipe } from 'effect'
import { downloadImageFile } from '../script.utils'
import * as Level from '../services/level'

// Modified to accept a URL instead of a File
function uploadImageToSanityFromURL(imageURL: string) {
  return pipe(
    downloadImageFile(imageURL),
    // Upload the image to Sanity
    Effect.flatMap((image) =>
      Effect.tryPromise({
        try: () => sanityServerClient.assets.upload('image', image),
        catch: (error) => new FailedUploadingImageError(error, image),
      }),
    ),
    Effect.tapError((error) =>
      Effect.logError('Failed uploading image', error),
    ),
    Effect.map((document) => ({
      sanity_id: document._id,
    })),
  )
}

export function downloadResourceImage(imageURL: string) {
  return Effect.gen(function* () {
    const level = yield* Level.Level
    const inCache = yield* level.use((client) => client.get(imageURL))

    if (inCache && typeof inCache === 'string') {
      return yield* Effect.succeed({ sanity_id: inCache })
    }

    const result = yield* uploadImageToSanityFromURL(imageURL)

    yield* level.use((client) => client.put(imageURL, result.sanity_id))

    return yield* Effect.succeed(result)
  })
}
