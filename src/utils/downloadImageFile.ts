import { HttpClient, HttpClientResponse, Path } from '@effect/platform'
import { Effect, Schema } from 'effect'

export function downloadImageFile(imageURL: string) {
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
