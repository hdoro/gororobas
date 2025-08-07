import {
  type AppBskyEmbedDefs,
  type AppBskyEmbedImages,
  type AppBskyFeedPost,
  AtpAgent,
  RichText,
} from '@atproto/api'
import { Config, Context, Data, Effect, Layer, Schema } from 'effect'
import { ImageObjectInDB } from '@/schemas'
import { downloadImageFile } from '@/utils/downloadImageFile'
import { getImageProps } from '@/utils/getImageProps'
import { sourcesToPlainText } from '@/utils/sources'
import { truncate } from '@/utils/strings'

export class BlueskyError extends Data.TaggedError('BlueskyError')<{
  cause?: unknown
  message?: string
}> {}

interface BlueskyImpl {
  use: <T>(
    fn: (agent: AtpAgent) => T,
  ) => Effect.Effect<Awaited<T>, BlueskyError, never>
  buildRichText: (text: string) => Effect.Effect<RichText, BlueskyError, never>
}
export class Bluesky extends Context.Tag('Bluesky')<Bluesky, BlueskyImpl>() {}

type BlueskyClientOptions = ConstructorParameters<typeof AtpAgent>[0]

const make = (
  options: BlueskyClientOptions,
  { identifier, password }: { identifier: string; password: string },
) =>
  Effect.gen(function* () {
    const agent = new AtpAgent(options)

    yield* Effect.logDebug(`[bluesky] Logging into Bluesky as ${identifier}`)
    const loginResponse = yield* Effect.tryPromise({
      try: () => agent.login({ identifier, password }),
      catch: (error) =>
        new BlueskyError({
          cause: error,
          message: 'Failed to login to Bluesky',
        }),
    })
    yield* Effect.logDebug(loginResponse)

    return Bluesky.of({
      use: (fn) =>
        Effect.gen(function* () {
          const result = yield* Effect.try({
            try: () => fn(agent),
            catch: (e) =>
              new BlueskyError({
                cause: e,
                message: 'Syncronous error in `Bluesky.use`',
              }),
          })
          if (result instanceof Promise) {
            return yield* Effect.tryPromise({
              try: () => result,
              catch: (e) =>
                new BlueskyError({
                  cause: e,
                  message: 'Asyncronous error in `Bluesky.use`',
                }),
            })
          }

          return result
        }).pipe(
          Effect.tapError((error) =>
            Effect.logDebug('Bluesky.use failed', error.cause),
          ),
        ),
      buildRichText: (text) =>
        Effect.gen(function* () {
          const rt = new RichText({
            text,
            facets: [],
          })
          yield* Effect.tryPromise({
            try: () => rt.detectFacets(agent),
            catch: (e) =>
              new BlueskyError({
                cause: e,
                message: 'Failed to detect facets in `buildRichText`',
              }),
          })

          return rt
        }),
    })
  })

export const fromEnv = Layer.scoped(
  Bluesky,
  Effect.gen(function* () {
    const identifier = yield* Config.string('BLUESKY_USERNAME')
    const password = yield* Config.string('BLUESKY_PASSWORD')
    return yield* make(
      { service: 'https://bsky.social' },
      { identifier, password },
    )
  }),
)

const uploadPostImages = (input?: BlueskyPostInput['images']) =>
  Effect.gen(function* () {
    const bluesky = yield* Bluesky
    const images = input || []

    return yield* Effect.all(
      images.map((image) =>
        Effect.gen(function* () {
          yield* Effect.logDebug('Downloading image')
          const imageProps =
            'url' in image
              ? {
                  src: image.url.toString(),
                }
              : getImageProps({
                  image,
                  maxWidth: 1200,
                })
          if (!imageProps.src) {
            return yield* Effect.fail(
              new BlueskyError({
                message: 'Invalid input image',
              }),
            )
          }
          const file = yield* downloadImageFile(imageProps.src)

          yield* Effect.logDebug('Downloaded image. Now uploading to Bluesky')
          const blobResponse = yield* bluesky.use((agent) =>
            agent.uploadBlob(file),
          )
          if (!blobResponse.success) {
            return yield* Effect.fail(
              new BlueskyError({
                cause: blobResponse,
                message: 'Failed to upload image',
              }),
            )
          }

          const aspectRatio: AppBskyEmbedDefs.AspectRatio | undefined =
            typeof imageProps.height === 'number' &&
            typeof imageProps.width === 'number'
              ? {
                  $type: 'app.bsky.embed.defs#aspectRatio',
                  height: imageProps.height,
                  width: imageProps.width,
                }
              : undefined

          return {
            aspectRatio,
            blob: blobResponse.data.blob,
            alt:
              image.label ||
              ('sources' in image
                ? sourcesToPlainText({
                    sources: image.sources,
                    prefix: 'Foto por ',
                  })
                : '') ||
              '',
            src: imageProps.src,
          }
        }).pipe(
          Effect.withLogSpan(
            `[bluesky/uploadPostImages] ${'url' in image ? image.url : image.sanity_id} (${image.label})`,
          ),
        ),
      ),
      { concurrency: 2 },
    )
  })

export const MAX_BLUESKY_MESSAGE_LENGTH = 300

const ImageFromURL = Schema.Struct({
  url: Schema.URL,
  label: Schema.String,
})

export const BlueskyImageInput = Schema.Array(
  Schema.Union(ImageFromURL, ImageObjectInDB),
)

export const BlueskyPostInput = Schema.Struct({
  message: Schema.String.pipe(Schema.maxLength(MAX_BLUESKY_MESSAGE_LENGTH)),
  images: Schema.optional(BlueskyImageInput),
})

export type BlueskyPostInput = typeof BlueskyPostInput.Type

export const postToBluesky = ({ message, images }: BlueskyPostInput) =>
  Effect.gen(function* () {
    if (message.length > MAX_BLUESKY_MESSAGE_LENGTH) {
      return yield* Effect.fail(
        new BlueskyError({ message: 'Message too long' }),
      )
    }
    const bluesky = yield* Bluesky

    yield* Effect.logDebug('Building rich text')
    const rt = yield* bluesky.buildRichText(message)

    yield* Effect.logDebug(
      'Rich text built.',
      rt,
      images?.length ? 'Now uploading images' : '',
    )
    const blobRes = yield* uploadPostImages(images)
    const post: AppBskyFeedPost.Record = {
      text: rt.text,
      facets: rt.facets || [],

      $type: 'app.bsky.feed.post',
      createdAt: new Date().toISOString(),
      langs: ['pt'],
    }
    if (blobRes.length > 0) {
      post.embed = {
        $type: 'app.bsky.embed.images',
        images: blobRes.map(({ blob, alt, aspectRatio }) => {
          const image: AppBskyEmbedImages.Image = {
            $type: 'app.bsky.embed.images#image',
            image: blob,
            alt,
          }
          if (aspectRatio) image.aspectRatio = aspectRatio
          return image
        }),
      }
    }

    yield* Effect.logDebug(
      `${blobRes.length} blobs uploaded. Now posting`,
      post,
    )
    const postResponse = yield* bluesky.use((agent) => agent.post(post))

    yield* Effect.logDebug('Post successful!', postResponse)
    return postResponse
  }).pipe(
    Effect.withLogSpan(`[bluesky/postToBluesky] ${truncate(message, 200)}`),
  )
