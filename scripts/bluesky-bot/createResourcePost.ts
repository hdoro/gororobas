import type { ContentToPostData } from '@/queries'
import {
  RESOURCE_FORMAT_ACTION_LABELS,
  RESOURCE_FORMAT_TO_LABEL,
} from '@/utils/labels'
import { stringToHashtag, truncate } from '@/utils/strings'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { Effect, Either, Schema } from 'effect'
import * as Bluesky from '../services/bluesky'

export const createResourcePost = (
  resource: ContentToPostData['resources'][number],
) =>
  Effect.gen(function* () {
    const hashtags = `${resource.tags.map((tag) => stringToHashtag(tag.names[0])).join(' ')} #Agroecologia`

    // Up to 278 characters, plus link
    const parts = [
      // "$RESOURCE_TITLE
      // $FORMAT por $CREDIT_LINE" - up to 102 characters
      `${truncate(resource.title, 50)}\n${truncate(RESOURCE_FORMAT_TO_LABEL[resource.format], 20)} ${resource.credit_line ? `por ${truncate(resource.credit_line, 30)}` : ''}`,
      // "$DESCRIPTION" - up to 153 characters
      resource.description
        ? `“${truncate(tiptapJSONtoPlainText(resource.description), 150)}”`
        : undefined,
      // "acesse em $URL" - up to 25 characters (plus link)
      `${truncate(RESOURCE_FORMAT_ACTION_LABELS[resource.format], 20)} em ${resource.url}`,
    ]

    const message = parts.filter(Boolean).join('\n\n')
    const truncatedHashtags = truncate(
      hashtags,
      Bluesky.MAX_BLUESKY_MESSAGE_LENGTH - message.length - 4,
    )

    const messageWithHashtags = [message, truncatedHashtags]
      .filter(Boolean)
      .join('\n\n')

    const thumbnails = Schema.decodeUnknownEither(Bluesky.BlueskyImageInput)([
      resource.thumbnail,
    ])

    return {
      message: messageWithHashtags,
      images: Either.isRight(thumbnails) ? thumbnails.right : [],
    } satisfies Bluesky.BlueskyPostInput
  })
