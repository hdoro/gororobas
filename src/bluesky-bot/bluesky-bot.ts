import { markContentAsPostedMutation } from '@/mutations'
import { type ContentToPostData, contentToPostQuery } from '@/queries'
import type { RichTextValue } from '@/schemas'
import * as Bluesky from '@/services/bluesky'
import * as Gel from '@/services/gel'
import { shuffleArray } from '@/utils/arrays'
import { truncate } from '@/utils/strings'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { pathToAbsUrl, paths } from '@/utils/urls'
import { Effect, Schema } from 'effect'
import { createResourcePost } from './createResourcePost'
import { createVegetablePost } from './createVegetablePost'

const createNotePost = (
  note: ContentToPostData['notes'][number],
): Bluesky.BlueskyPostInput => {
  const title = tiptapJSONtoPlainText(note.title as RichTextValue)
  const mainMessage = [
    truncate(title, 150),
    title.length < 150 &&
      note.body &&
      `${truncate(tiptapJSONtoPlainText(note.body), 50)}`,
  ]
    .filter(Boolean)
    .join('\n')
    .replace(/\n{2,}/g, '\n')

  // up to 254 characters, plus link
  const parts = [
    // Up to 204 characters
    `“${mainMessage}”`,
    // Up to 50 characters (plus link)
    note.created_by?.name &&
      `Notinha por ${truncate(note.created_by.name, 20)}, disponível em: ${pathToAbsUrl(paths.note(note.handle), true)}`,
  ]
  const message = parts.filter(Boolean).join('\n\n')

  return {
    message,
    images: [
      {
        url: new URL(
          `${pathToAbsUrl(paths.note(note.handle), true)}/opengraph-image`,
        ),
        label: `Um post-it da nota, com o mesmo conteúdo deste post: ${truncate(title, 50)}`,
      },
    ],
  }
}

/**
 * Converts a piece of content from Gel into a Bluesky with appropriate content-specific handlers.
 *
 * These handlers may fail when the template doesn't return a valid post (usually due to length constraints).
 * As such, we use `Effect.firstSuccessOf` to try multiple content pieces until one succeeds.
 */
const contentToPost = (
  entry: ContentToPostData['notes' | 'resources' | 'vegetables'][number],
) =>
  Effect.gen(function* () {
    if (entry.type === 'default::Note') {
      return yield* Schema.decodeUnknown(Bluesky.BlueskyPostInput)(
        createNotePost(entry),
      )
    }

    if (entry.type === 'default::Resource') {
      return yield* Schema.decodeUnknown(Bluesky.BlueskyPostInput)(
        createResourcePost(entry),
      )
    }

    // default ::Vegetable
    return yield* createVegetablePost(entry)
  }).pipe(
    Effect.map((post) => ({
      post,
      selectedContent: entry,
    })),
  )

export const postContentToBluesky = Effect.gen(function* () {
  const gel = yield* Gel.Gel
  const content = yield* gel.use((client) => {
    return contentToPostQuery.run(
      client.withConfig({ apply_access_policies: false }),
    )
  })
  yield* Effect.logDebug('Got content to consider:', content)

  // Whichever content first yields a valid post will be used
  const { post, selectedContent } = yield* Effect.firstSuccessOf(
    shuffleArray(Object.values(content).flat().map(contentToPost)),
  )

  if (!post) {
    return yield* Effect.fail('No post to create')
  }

  yield* Effect.logDebug('Post to create:', post)
  yield* Bluesky.postToBluesky(post)

  yield* Effect.logDebug('Marking content as posted:', post)
  yield* gel.use((client) => {
    return markContentAsPostedMutation.run(
      client.withConfig({ apply_access_policies: false }),
      {
        content_id: selectedContent.id,
        text: post.message,
      },
    )
  })

  return { success: true }
}).pipe(
  Effect.catchAll((error) => {
    return Effect.succeed({ success: false, error })
  }),
)
