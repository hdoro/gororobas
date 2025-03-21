// Adaptation of https://github.com/bmdavis419/notion-discord-notifications/blob/main/src/redis.ts
// See: https://youtu.be/S1YKKpLR7XI
import type { YoutubeIdType } from '@/schemas'
import { youtube_v3 } from '@googleapis/youtube'
import { Config, Context, Data, Effect, Layer } from 'effect'

export class YoutubeError extends Data.TaggedError('YoutubeError')<{
  cause?: unknown
  message?: string
}> {}

interface YoutubeImpl {
  use: <T>(
    fn: (client: youtube_v3.Youtube) => T,
  ) => Effect.Effect<Awaited<T>, YoutubeError, never>
}
export class Youtube extends Context.Tag('Youtube')<Youtube, YoutubeImpl>() {}

type YoutubeClientOptions = ConstructorParameters<typeof youtube_v3.Youtube>[0]

const make = (options: YoutubeClientOptions) =>
  Effect.gen(function* () {
    const client = new youtube_v3.Youtube(options)
    return Youtube.of({
      use: (fn) =>
        Effect.gen(function* () {
          const result = yield* Effect.try({
            try: () => fn(client),
            catch: (e) =>
              new YoutubeError({
                cause: e,
                message: 'Syncronous error in `Youtube.use`',
              }),
          })
          if (result instanceof Promise) {
            return yield* Effect.tryPromise({
              try: () => result,
              catch: (e) =>
                new YoutubeError({
                  cause: e,
                  message: 'Asyncronous error in `Youtube.use`',
                }),
            })
          } else {
            return result
          }
        }),
    })
  })

export const fromEnv = Layer.scoped(
  Youtube,
  Effect.gen(function* () {
    const apiKey = yield* Config.string('GOOGLE_DATA_API_KEY')
    return yield* make({ auth: apiKey })
  }),
)

export const getVideosMetadata = (videoIds: YoutubeIdType[]) =>
  Effect.gen(function* () {
    const youtube = yield* Youtube
    const videos = yield* youtube.use((client) =>
      client.videos.list({
        part: ['snippet', 'topicDetails', 'statistics'],
        id: videoIds,
      }),
    )

    const items = videos.data.items || []
    if (items.length === 0) {
      return yield* Effect.fail(
        new YoutubeError({ message: 'Videos not found' }),
      )
    }

    yield* Effect.logInfo(`Got video metadata: ${videoIds.join(', ')}`)

    return videoIds.map((videoId) => {
      const metadata = items.find((item) => item.id === videoId)
      return {
        id: videoId,
        metadata,
      }
    })
  }).pipe(Effect.withLogSpan('getVideosMetadata'))
