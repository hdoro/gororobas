import type { ImageForRenderingData } from '@/queries'
import { getImageProps } from '@/utils/getImageProps'
import { sourcesToPlainText } from '@/utils/sources'
import { truncate } from '@/utils/strings'
import {
  AtpAgent,
  RichText,
  type AppBskyEmbedDefs,
  type AppBskyFeedPost,
} from '@atproto/api'
import { Config, Context, Data, Effect, Layer } from 'effect'
import { downloadImageFile } from '../resource-library-bootstrap/download-resource-image'

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

const make = (options: BlueskyClientOptions) =>
  Effect.gen(function* () {
    const agent = new AtpAgent(options)
    const identifier = yield* Config.string('BLUESKY_USERNAME')
    const password = yield* Config.string('BLUESKY_PASSWORD')

    yield* Effect.logDebug(`[bluesky] Logging into Bluesky as ${identifier}`)
    const loginResponse = yield* Effect.tryPromise({
      try: () => agent.login({ identifier: identifier, password }),
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
          } else {
            return result
          }
        }),
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

export const layer = Layer.scoped(
  Bluesky,
  Effect.gen(function* () {
    return yield* make({ service: 'https://bsky.social' })
  }),
)

const uploadPostImages = (input?: ImageForRenderingData[]) =>
  Effect.gen(function* () {
    const bluesky = yield* Bluesky
    const images = input || []

    return yield* Effect.all(
      images.map((image) =>
        Effect.gen(function* () {
          yield* Effect.logDebug('Downloading image')
          const imageProps = getImageProps({
            image,
            maxWidth: 1200,
          })
          if (
            !imageProps.src ||
            typeof imageProps.width !== 'number' ||
            typeof imageProps.height !== 'number'
          ) {
            return yield* Effect.fail(
              new BlueskyError({
                message: `Invalid input image: ${image.sanity_id}`,
              }),
            )
          }
          const file = yield* downloadImageFile(imageProps.src)

          yield* Effect.logDebug(`Downloaded image. Now uploading to Bluesky`)
          const blobResponse = yield* bluesky.use((agent) =>
            agent.uploadBlob(file),
          )
          if (!blobResponse.success) {
            return yield* Effect.fail(
              new BlueskyError({
                cause: blobResponse,
                message: `Failed to upload image: ${image.sanity_id}`,
              }),
            )
          }

          const aspectRatio: AppBskyEmbedDefs.AspectRatio = {
            $type: 'app.bsky.embed.defs#aspectRatio',
            height: imageProps.height,
            width: imageProps.width,
          }

          return {
            aspectRatio,
            blob: blobResponse.data.blob,
            alt:
              image.label ||
              sourcesToPlainText({
                sources: image.sources,
                prefix: 'Foto por ',
              }) ||
              '',
            src: imageProps.src,
          }
        }).pipe(
          Effect.withLogSpan(
            `[bluesky/uploadPostImages] ${image.sanity_id} (${image.label})`,
          ),
        ),
      ),
      { concurrency: 2 },
    )
  })

export type BlueskyPostInput = {
  message: string
  images?: ImageForRenderingData[]
}

export const postToBluesky = ({ message, images }: BlueskyPostInput) =>
  Effect.gen(function* () {
    const bluesky = yield* Bluesky

    yield* Effect.logDebug('Building rich text')
    const rt = yield* bluesky.buildRichText(message)

    yield* Effect.logDebug(
      'Rich text built.',
      rt,
      images?.length ? 'Now uploading images' : '',
    )
    const blobRes = yield* uploadPostImages(images)
    let post: AppBskyFeedPost.Record = {
      text: rt.text,
      // @TODO debug why facet isn't being set - links aren't expanded in the published post
      facet: rt.facets,

      $type: 'app.bsky.feed.post',
      createdAt: new Date().toISOString(),
      langs: ['pt'],
    }
    if (blobRes.length > 0) {
      post.embed = {
        $type: 'app.bsky.embed.images',
        images: blobRes.map(({ blob, alt, aspectRatio }) => ({
          $type: 'app.bsky.embed.images#image',
          image: blob,
          alt,
          aspectRatio,
        })),
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
