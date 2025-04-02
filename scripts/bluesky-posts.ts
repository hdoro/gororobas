import { contentToPostQuery, type ContentToPostData } from '@/queries'
import type { RichTextValue } from '@/schemas'
import { shuffleArray } from '@/utils/arrays'
import { RESOURCE_FORMAT_TO_LABEL } from '@/utils/labels'
import { gender, truncate } from '@/utils/strings'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { paths, pathToAbsUrl } from '@/utils/urls'
import { FetchHttpClient } from '@effect/platform'
import { NodeContext, NodeRuntime } from '@effect/platform-node'
import { Effect, Layer, Logger, LogLevel } from 'effect'
import * as Bluesky from './services/bluesky'
import * as Gel from './services/gel'

const AllServices = Layer.mergeAll(
  Bluesky.layer,
  NodeContext.layer,
  FetchHttpClient.layer,
  Gel.layer,
)

const createVegetablePost = (
  vegetable: ContentToPostData['vegetables'][number],
): Bluesky.BlueskyPostInput => {
  // Create a more informative and engaging message about the vegetable
  const mainMessage = `Conheça as propriedades agroecológicas ${gender.preposition(
    vegetable.gender || 'NEUTRO',
  )} ${vegetable.name}: ${pathToAbsUrl(paths.vegetable(vegetable.handle), true)}`

  // Add hashtags for better discoverability
  const hashtags = '#Agroecologia #Gororobas'

  // Combine the message with hashtags
  const message = `${mainMessage}\n\n${hashtags}`

  return {
    message,
    images: vegetable.photos.slice(0, 3),
  }
}

const createResourcePost = (
  resource: ContentToPostData['resources'][number],
): Bluesky.BlueskyPostInput => {
  // Add hashtags for better discoverability
  const hashtags = `#Agroecologia ${resource.tags.map((tag) => `#${tag.names[0].replace(/\s/g, '-')}`).join(' ')}`

  // Combine the message with hashtags
  const parts = [
    resource.title,
    `${RESOURCE_FORMAT_TO_LABEL[resource.format]} ${resource.credit_line ? `por ${resource.credit_line}` : undefined}`,
    resource.url,
    hashtags,
  ]
  const message = parts.filter(Boolean).join('\n\n')

  return {
    message,
    images: resource.thumbnail ? [resource.thumbnail] : [],
  }
}

const createNotePost = (
  note: ContentToPostData['notes'][number],
): Bluesky.BlueskyPostInput => {
  // Add hashtags for better discoverability
  const hashtags = `#Agroecologia`

  // Combine the message with hashtags
  const parts = [
    truncate(tiptapJSONtoPlainText(note.title as RichTextValue), 150),
    note.created_by?.name && `Notinha por ${note.created_by.name}`,
    pathToAbsUrl(paths.note(note.handle), true),
    hashtags,
  ]
  const message = parts.filter(Boolean).join('\n\n')

  return {
    message,
    // images: note.photos.slice(0, 3),
  }
}

const program = Effect.gen(function* () {
  const gel = yield* Gel.Gel
  const content = yield* gel.use((client) => {
    return contentToPostQuery.run(client)
  })

  yield* Effect.logDebug(`Got content to consider:`, content)
  const selectedContent = shuffleArray(Object.values(content).flat())[0]
  yield* Effect.logDebug(`Selected content:`, selectedContent)

  let post: Bluesky.BlueskyPostInput | undefined
  if (selectedContent.type === 'default::Note') {
    post = createNotePost(selectedContent)
  } else if (selectedContent.type === 'default::Resource') {
    post = createResourcePost(selectedContent)
  } else if (selectedContent.type === 'default::Vegetable') {
    post = createVegetablePost(selectedContent)
  }
  yield* Effect.logDebug(`Post to create:`, post)
  if (!post) {
    return yield* Effect.fail('No post to create')
  }

  yield* Bluesky.postToBluesky(post)
})

NodeRuntime.runMain(
  Effect.scoped(program).pipe(
    Effect.provide(AllServices),
    Logger.withMinimumLogLevel(LogLevel.Debug),
  ),
)
