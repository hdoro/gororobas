// Adaptation of https://github.com/bmdavis419/notion-discord-notifications/blob/main/src/redis.ts
// See: https://youtu.be/S1YKKpLR7XI

import { youtube_v3 } from '@googleapis/youtube'
import { Config, Context, Data, Effect, Layer, Schema } from 'effect'
import { YoutubeTranscript } from 'youtube-transcript'
import { YoutubeVideoId } from '@/schemas'
import * as Level from './level'

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
          }

          return result
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

const YoutubeThumbnails = Schema.Record({
  key: Schema.String,
  value: Schema.Struct({
    url: Schema.String,
    width: Schema.Number,
    height: Schema.Number,
  }),
})

export const YoutubeChannelSnippet = Schema.Struct({
  id: Schema.String,
  etag: Schema.String,
  kind: Schema.String,
  snippet: Schema.Struct({
    title: Schema.String,
    description: Schema.String,
    customUrl: Schema.NullishOr(Schema.String),
    publishedAt: Schema.DateFromString,
    defaultLanguage: Schema.String,
    country: Schema.String,
    thumbnails: YoutubeThumbnails,
    localized: Schema.Struct({
      title: Schema.String,
      description: Schema.String,
    }),
  }),
})

const ChannelURL = Schema.TemplateLiteralParser(
  'https://www.youtube.com/@',
  Schema.NonEmptyString,
)

export const YoutubeVideoSearchResult = Schema.Struct({
  kind: Schema.String,
  etag: Schema.String,
  id: Schema.Struct({
    kind: Schema.String,
    videoId: YoutubeVideoId,
  }),
  snippet: Schema.Struct({
    publishedAt: Schema.DateFromString,
    channelId: Schema.String,
    title: Schema.String,
    description: Schema.String,
    thumbnails: YoutubeThumbnails,
    channelTitle: Schema.String,
    liveBroadcastContent: Schema.String,
    publishTime: Schema.DateFromString,
  }),
})

export const YoutubeVideosList = Schema.Array(YoutubeVideoSearchResult)

export const getChannel = (channelURL: string) =>
  Effect.gen(function* () {
    const youtube = yield* Youtube
    const [, channelHandle] =
      yield* Schema.decodeUnknown(ChannelURL)(channelURL)

    const level = yield* Level.Level
    const cached = yield* level.get({
      key: `channel/${channelHandle}`,
      schema: YoutubeChannelSnippet,
    })
    if (cached) {
      return cached
    }

    const result = yield* youtube.use((client) =>
      client.channels.list({
        part: ['snippet'],
        forHandle: channelHandle,
      }),
    )

    const channel = yield* Schema.decodeUnknown(YoutubeChannelSnippet)(
      result.data.items?.[0],
    )

    yield* Effect.logInfo(
      `Got channel metadata for channel ${channel.snippet.title}`,
    )

    // Cache for faster/cheaper access in the future
    yield* level.put({
      key: `channel/${channelHandle}`,
      schema: YoutubeChannelSnippet,
      value: channel,
    })
    return channel
  })

export const getChannelVideos = (channel: typeof YoutubeChannelSnippet.Type) =>
  Effect.gen(function* () {
    const level = yield* Level.Level
    const cached = yield* level.get({
      key: `channel-videos/${channel.id}`,
      schema: YoutubeVideosList,
    })
    if (cached) {
      return cached
    }

    const youtube = yield* Youtube
    const result = yield* youtube.use((client) =>
      client.search.list({
        part: ['snippet'],
        channelId: channel.id,
        maxResults: 50,
        order: 'date',
        type: ['video'],
      }),
    )

    const videos = yield* Schema.decodeUnknown(YoutubeVideosList)(
      result.data.items,
    )

    yield* Effect.logInfo(
      `Found ${videos.length} videos. ${result.data.pageInfo?.totalResults} total results`,
    )

    yield* level.put({
      key: `channel-videos/${channel.id}`,
      schema: YoutubeVideosList,
      value: videos,
    })

    return videos
  })

const VideoTranscript = Schema.Array(
  Schema.Struct({
    text: Schema.String,
    duration: Schema.Number,
    offset: Schema.Number,
    lang: Schema.NullishOr(Schema.String),
  }),
)

export class YoutubeTranscriptionError extends Data.TaggedError(
  'YoutubeTranscriptionError',
)<{
  cause?: unknown
  message?: string
}> {}

export type VideoWithTranscript = Effect.Effect.Success<
  ReturnType<typeof getVideoTranscripts>
>[number]

export const getVideoTranscripts = (videos: typeof YoutubeVideosList.Type) =>
  Effect.gen(function* () {
    const level = yield* Level.Level
    return yield* Effect.all(
      videos.map((video) =>
        Effect.gen(function* () {
          const cached = yield* level.get({
            key: `video-transcripts/${video.id.videoId}`,
            schema: VideoTranscript,
          })
          if (cached) {
            return {
              video,
              transcript: cached,
            }
          }

          const result = yield* Effect.tryPromise({
            try: () => YoutubeTranscript.fetchTranscript(video.id.videoId),
            catch: (e) =>
              new YoutubeTranscriptionError({
                cause: e,
                message: `Failed to fetch transcript for video ${video.id.videoId}`,
              }),
          })
          const transcript =
            yield* Schema.decodeUnknown(VideoTranscript)(result)

          yield* Effect.logInfo(`Got transcript for video ${video.id.videoId}`)
          yield* level.put({
            key: `video-transcripts/${video.id.videoId}`,
            value: transcript,
            schema: VideoTranscript,
          })

          return {
            video,
            transcript: transcript,
          }
        }),
      ),
      { concurrency: 2 },
    )
  })
