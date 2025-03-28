import { slugify, truncate } from '@/utils/strings'
import { FileSystem, Path } from '@effect/platform'
import { generateObject } from 'ai'
import { Data, Effect } from 'effect'
import { glob } from 'glob'
import { ollama } from 'ollama-ai-provider'
import { z, type ZodLiteral } from 'zod'
import {
  processTagFile,
  type TagMetadata,
} from '../resource-library-bootstrap/import-resources'
import { addResourceToInbox } from './add-resource-to-inbox'
import {
  getChannel,
  getChannelVideos,
  getVideoTranscripts,
  type VideoWithTranscript,
} from './youtube'

const MODEL = ollama('phi4')

export class AiError extends Data.TaggedError('AiError')<{
  cause?: unknown
  message?: string
}> {}

const processVideo = ({
  video,
  transcript,
  tags,
}: VideoWithTranscript & {
  tags: (typeof TagMetadata.Type & { handle: string })[]
}) =>
  Effect.gen(function* () {
    const handle = slugify(
      `${truncate(video.snippet.title, 50)} ${truncate(video.snippet.channelTitle, 30)}`,
    )
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    // If already exists outside triage, skip
    const inboxExists = yield* fs.exists(
      path.join(
        'scripts/resource-library-bootstrap/resources/inbox',
        `${handle}.md`,
      ),
    )
    const processedExists = yield* fs.exists(
      path.join(
        'scripts/resource-library-bootstrap/resources/processed',
        `${handle}.md`,
      ),
    )
    const triageExists = yield* fs.exists(
      path.join(
        'scripts/resource-library-bootstrap/resources/triage',
        `${handle}.md`,
      ),
    )
    if (inboxExists || processedExists || triageExists) {
      return
    }

    yield* Effect.log(`Processing video: ${video.snippet.title}`)
    const SCHEMA = z.object({
      tags: z.optional(
        z.array(
          z.union(
            tags.map((t) =>
              z.literal(t.handle, { description: t.names.join(', ') }),
            ) as unknown as Readonly<
              [ZodLiteral<string>, ZodLiteral<string>, ...ZodLiteral<string>[]]
            >,
          ),
        ),
      ),
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
      inboxFolder: 'scripts/resource-library-bootstrap/resources/triage',
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
    })

    yield* addResourceToInbox({ ...content, tags: result.object.tags })
  })

export const processChannelVideos = (channelURL: string) =>
  Effect.gen(function* () {
    const channel = yield* getChannel(channelURL)
    const videos = yield* getChannelVideos(channel)
    const withTranscript = yield* getVideoTranscripts(videos)

    yield* Effect.log(
      `Processing ${withTranscript.length} videos from channel ${channelURL}`,
    )
    const tagFiles = yield* Effect.tryPromise(() =>
      glob('scripts/resource-library-bootstrap/tags/inbox/**/*.md'),
    )
    const tags = yield* Effect.all(tagFiles.map(processTagFile), {
      concurrency: 'unbounded',
    })

    yield* Effect.all(
      withTranscript.map((v) => processVideo({ ...v, tags })),
      { concurrency: 1 },
    )
  })
