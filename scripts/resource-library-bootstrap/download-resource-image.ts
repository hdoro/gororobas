import { FailedUploadingImageError } from '@/types/errors'
import { sanityServerClient } from '@/utils/sanity.client'
import { HttpClient, HttpClientResponse, Path } from '@effect/platform'
import { Effect, pipe, Schema } from 'effect'
import * as Level from '../resource-sourcing/level'

function downloadImageFile(imageURL: string) {
  return Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const path = yield* Path.Path
    const url = yield* Schema.decode(Schema.URL)(imageURL)

    const response = yield* client.get(url)

    if (response.status !== 200) {
      return yield* Effect.fail(
        new Error(`Failed to fetch image: ${response.status}`),
      )
    }

    // Ensure the content type is an image
    const headers = yield* HttpClientResponse.schemaHeaders(
      Schema.Struct({
        'content-type': Schema.TemplateLiteral('image/', Schema.String),
      }),
    )(response)

    // Get the image data & filename
    const arrayBuffer = yield* response.arrayBuffer
    const filename = path.basename(url.pathname) || 'image'

    return new File([arrayBuffer], filename, { type: headers['content-type'] })
  })
}

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
