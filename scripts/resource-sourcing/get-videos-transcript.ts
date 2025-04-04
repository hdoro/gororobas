import * as Level from '@/services/level'
import * as Youtube from '@/services/youtube'
import { Data, Effect, Schema } from 'effect'
import { YoutubeTranscript } from 'youtube-transcript'

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

export const getVideoTranscripts = (
  videos: typeof Youtube.YoutubeVideosList.Type,
) =>
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
