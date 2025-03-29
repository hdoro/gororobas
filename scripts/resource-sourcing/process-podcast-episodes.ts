import { slugify, truncate } from '@/utils/strings'
import { FileSystem, Path } from '@effect/platform'
import { generateObject } from 'ai'
import { Data, Effect } from 'effect'
import { ollama } from 'ollama-ai-provider'
import Parser, { type Output } from 'rss-parser'
import { z } from 'zod'
import { SCRIPT_PATHS } from '../script.utils'
import {
  addResourceToInbox,
  type ResourceCustomizer,
} from './add-resource-to-inbox'
import { getTagsSchema, type TagsForAISchema } from './get-tags-schema'
import { AiError } from './process-channel-videos'

export class RSSError extends Data.TaggedError('RSSError')<{
  cause?: unknown
  message?: string
}> {}

const MODEL = ollama('phi4')

const processEpisode = <O extends Output<{ [key: string]: any }>>({
  episode,
  feed,
  tagsSchema,
  customizer,
}: {
  feed: O
  episode: O['items'][number]
  tagsSchema: TagsForAISchema
  customizer?: ResourceCustomizer | undefined
}) =>
  Effect.gen(function* () {
    const handle = slugify(
      `${truncate(episode.title || '', 50)} ${truncate(feed.title || '', 30)}`,
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

    yield* Effect.log(`Processing episode: ${episode.title}`)
    const SCHEMA = z.object({
      tags: z.optional(tagsSchema.schema),
    })

    const thumbnail = episode.itunes?.image
    const content: Omit<Parameters<typeof addResourceToInbox>[0], 'tags'> = {
      title: episode.title || '',
      credit_line: feed.title || '',
      format: 'PODCAST',
      url: episode.link || '',
      thumbnail: thumbnail,
      related_vegetables: undefined,
      description: episode.contentSnippet || '',
      handle: handle,
      inboxFolder: SCRIPT_PATHS.resources.triage,
      content: JSON.stringify(episode, null, 2),
    }
    const result = yield* Effect.tryPromise({
      try: () =>
        generateObject({
          model: MODEL,
          schema: SCHEMA,
          prompt: `Segundo as informações do episódio de podcast abaixo, em quais tags o conteúdo se enquadra?
        
        Episódio: ${content.title}
        Por: ${content.credit_line}
        
        Descrição:
        
        ${content.description}
        `,
        }),
      catch: (error) =>
        new AiError({
          cause: error,
          message: `Failed to generate tags for episode ${content.title}`,
        }),
    }).pipe(
      Effect.tapError((error) =>
        Effect.logError(`[podcast episode] ${content.title}:`, error),
      ),
      Effect.catchAll(() => Effect.succeed({ object: { tags: undefined } })),
    )

    const filePath = yield* addResourceToInbox({
      ...content,
      tags: result.object.tags,
      customizer,
    })
    yield* Effect.logInfo(`✅ [podcast episode] added to ${filePath}`)
  })

export const processPodcastEpisodes = (
  rssFeedURL: string,
  customizer?: ResourceCustomizer,
) =>
  Effect.gen(function* () {
    const parser = new Parser()
    const feed = yield* Effect.tryPromise({
      try: () => parser.parseURL(rssFeedURL),
      catch: (error) =>
        new RSSError({ cause: error, message: 'Failed to parse RSS feed' }),
    })

    const tagsSchema = yield* getTagsSchema

    yield* Effect.all(
      feed.items.map((item) =>
        processEpisode({
          episode: item,
          feed,
          tagsSchema,
          customizer,
        }),
      ),
      { concurrency: 1 },
    )
  })
