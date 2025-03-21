import {
  YoutubeId,
  YoutubeURL,
  type YoutubeIdType,
  type YoutubeURLType,
} from '@/schemas'
import { getYouTubeID } from '@/utils/youtube'
import { Effect, Layer, Schema } from 'effect'
import * as Level from './level.js'
import * as Youtube from './youtube.js'

const VideoURLs = Schema.NonEmptyArray(YoutubeURL)

const AllServices = Layer.mergeAll(
  Level.layer('./scripts/yt-analyzer/db'),
  Youtube.fromEnv,
)

const VideoInCache = Schema.Struct({
  id: YoutubeId,
  url: YoutubeURL,
  status: Schema.Literal('pending', 'metadata-ready', 'failed', 'analyzed'),
  metadata: Schema.optional(Schema.NullishOr(Schema.Any)),
})

const getVideoInCache = (videoId: YoutubeIdType) =>
  Effect.gen(function* () {
    const level = yield* Level.Level
    const inCache = yield* level.use((client) => client.get(videoId))

    return yield* Schema.decodeUnknown(Schema.NullishOr(VideoInCache))(inCache)
  })

/**
 * @TODO
 * - properly work with LevelDB - schema is breaking somehow
 * - fetch metadata in bulk, apply individually to DB
 * - fetch transcript individually, with concurrency: 2, then apply to DB
 * - on metadata-ready, have AI analyze the content for classification
 */
const analyzeVideos = (rawURLs: string[]) =>
  Effect.gen(function* () {
    const videoUrls = yield* Schema.decodeUnknown(VideoURLs)(rawURLs)
    const videoIDs = videoUrls.map((url) => getYouTubeID(url))

    const inCache = yield* Effect.all(
      videoUrls.map((videoUrl) => {
        const videoId = getYouTubeID(videoUrl)
        return getVideoInCache(videoId).pipe(
          Effect.map((inCache) => ({
            videoId,
            videoUrl,
            inCache,
            status: inCache?.status || 'pending',
          })),
        )
      }),
    )

    const level = yield* Level.Level
    yield* level.use((client) =>
      client.batch(
        inCache.flatMap((v) => {
          if (!v.inCache) {
            return [
              {
                type: 'put',
                key: v.videoId,
                value: Schema.encodeSync(VideoInCache)({
                  id: v.videoId,
                  url: v.videoUrl,
                  status: 'pending',
                }),
                valueEncoding: 'json',
              },
            ]
          }
          return []
        }),
      ),
    )

    const videosMetadata = yield* Youtube.getVideosMetadata(videoIDs)

    yield* level.use((client) =>
      client.batch(
        videosMetadata.flatMap(({ id, metadata }) => {
          if (metadata) {
            return [
              {
                type: 'put',
                key: id,
                value: Schema.encodeSync(VideoInCache)({
                  id,
                  url: inCache.find((v) => v.videoId === id)
                    ?.videoUrl as YoutubeURLType, // @TODO how-to partial updates?
                  status: 'metadata-ready',
                  metadata,
                }),
                valueEncoding: 'json',
              },
            ]
          }
          return []
        }),
      ),
    )
  })

async function main() {
  await Effect.runPromise(
    analyzeVideos(['https://youtu.be/S1YKKpLR7XI?feature=shared']).pipe(
      Effect.provide(AllServices),
    ),
  )
}

main()
