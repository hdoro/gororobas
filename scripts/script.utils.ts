import { HttpClient, HttpClientResponse, Path } from '@effect/platform'
import { Effect, Schema } from 'effect'

const BASE_FOLDER = 'scripts'
const RESOURCE_LIBRARY_FOLDER = `${BASE_FOLDER}/resource-library-bootstrap/resources`
const TAG_LIBRARY_FOLDER = `${BASE_FOLDER}/resource-library-bootstrap/tags`

export const SCRIPT_PATHS = {
  sourcing_db: `${BASE_FOLDER}/resource-sourcing/db`,
  images_downloading_cache: `${BASE_FOLDER}/resource-library-bootstrap/images-cache`,
  resources: {
    root: RESOURCE_LIBRARY_FOLDER,
    inbox: `${RESOURCE_LIBRARY_FOLDER}/inbox`,
    processed: `${RESOURCE_LIBRARY_FOLDER}/processed`,
    triage: `${RESOURCE_LIBRARY_FOLDER}/triage`,
    discarded: `${RESOURCE_LIBRARY_FOLDER}/discarded`,
  },
  tags: {
    root: TAG_LIBRARY_FOLDER,
    inbox: `${TAG_LIBRARY_FOLDER}/inbox`,
    processed: `${TAG_LIBRARY_FOLDER}/processed`,
  },
} as const

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
