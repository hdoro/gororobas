import { slugify, truncate } from '@/utils/strings'
import { FileSystem, Path } from '@effect/platform'
import { generateObject } from 'ai'
import { Data, Effect } from 'effect'
import { ollama } from 'ollama-ai-provider'
import { z } from 'zod'
import { SCRIPT_PATHS } from '../script.utils'
import {
  getChannel,
  getChannelVideos,
  getVideoTranscripts,
  type VideoWithTranscript,
} from '../services/youtube'
import {
  addResourceToInbox,
  type ResourceCustomizer,
} from './add-resource-to-inbox'
import { getTagsSchema, type TagsForAISchema } from './get-tags-schema'

const MODEL = ollama('phi4')

export class AiError extends Data.TaggedError('AiError')<{
  cause?: unknown
  message?: string
}> {}

const processVideo = ({
  video,
  transcript,
  tagsSchema,
  customizer,
}: VideoWithTranscript & {
  tagsSchema: TagsForAISchema
  customizer?: ResourceCustomizer | undefined
}) =>
  Effect.gen(function* () {
    const handle = slugify(
      `${truncate(video.snippet.title, 50)} ${truncate(video.snippet.channelTitle, 30)}`,
    )
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const existingFiles = yield* Effect.all(
      Object.values(SCRIPT_PATHS.resources).map((folder) =>
        fs.exists(path.join(folder, `${handle}.md`)),
      ),
    )
    if (existingFiles.some(Boolean)) {
      return
    }

    yield* Effect.log(`Processing video: ${video.snippet.title}`)
    const SCHEMA = z.object({
      tags: z.optional(tagsSchema.schema),
    })

    const highestResThumbnail = Object.entries(video.snippet.thumbnails).sort(
      (a, b) => b[1].width - a[1].width,
    )[0][1]
    const content: Omit<Parameters<typeof addResourceToInbox>[0], 'tags'> = {
      title: video.snippet.title,
      credit_line: video.snippet.channelTitle,
      format: 'VIDEO',
      url: `https://youtu.be/${video.id.videoId}`,
      thumbnail: highestResThumbnail?.url,
      related_vegetables: undefined,
      description: video.snippet.description,
      handle: handle,
      content: transcript.map((t) => t.text).join(' '),
      inboxFolder: SCRIPT_PATHS.resources.triage,
    }

    const result = yield* Effect.tryPromise({
      try: () =>
        generateObject({
          model: MODEL,
          schema: SCHEMA,
          prompt: `Segundo as informações e transcrição do vídeo abaixo, em quais tags o conteúdo se enquadra?
        
        Vídeo: ${content.title}
        Por: ${content.credit_line}
        
        Transcrição:
        
        ${content.content}
        `,
        }),
      catch: (error) =>
        new AiError({
          cause: error,
          message: `Failed to generate tags for video ${content.title}`,
        }),
    }).pipe(
      Effect.tapError((error) =>
        Effect.logError(`[video] ${content.title}:`, error),
      ),
      Effect.catchAll(() => Effect.succeed({ object: { tags: undefined } })),
    )

    const filePath = yield* addResourceToInbox({
      ...content,
      tags: result.object.tags,
      customizer,
    })
    yield* Effect.logInfo(`✅ [video] added to ${filePath}`)
  })

export const processChannelVideos = (
  channelURL: string,
  customizer?: ResourceCustomizer,
) =>
  Effect.gen(function* () {
    const channel = yield* getChannel(channelURL)
    const videos = yield* getChannelVideos(channel)
    const withTranscript = yield* getVideoTranscripts(videos)

    yield* Effect.log(
      `Processing ${withTranscript.length} videos from channel ${channelURL}`,
    )

    const tagsSchema = yield* getTagsSchema
    yield* Effect.all(
      withTranscript.map((v) => processVideo({ ...v, tagsSchema, customizer })),
      { concurrency: 1 },
    )
  })
