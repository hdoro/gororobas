import { markContentAsPostedMutation } from '@/mutations'
import { contentToPostQuery, type ContentToPostData } from '@/queries'
import type { RichTextValue } from '@/schemas'
import { shuffleArray } from '@/utils/arrays'
import {
  PLANTING_METHOD_TO_LABEL,
  RESOURCE_FORMAT_ACTION_LABELS,
  RESOURCE_FORMAT_TO_LABEL,
  STRATUM_TO_LABEL,
} from '@/utils/labels'
import {
  capitalize,
  gender,
  semanticListItems,
  stringToHashtag,
  truncate,
} from '@/utils/strings'
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

/** @TODO character limits */
const createVegetablePost = (
  vegetable: ContentToPostData['vegetables'][number],
): Bluesky.BlueskyPostInput => {
  // Up to 459 characters
  const mainMessage = [
    // "O $VEGETAL" - up to 32 characters
    capitalize(gender.article(vegetable.gender || 'NEUTRO')),
    ` ${truncate(vegetable.name, 30)}`,
    // ($NOME_CIENTIFICO) - up to 33 characters
    vegetable.scientific_names?.[0] &&
      ` (${truncate(vegetable.scientific_names[0], 30)})`,
    // "Também conhecido como $NOME1, $NOME2 ou $NOME3" - 24 + 3 * (20 + 3) = up to 93 characters
    vegetable.names.length > 1 &&
      `, também conhecid${gender.suffix(vegetable.gender || 'NEUTRO')} como ${semanticListItems(
        vegetable.names.slice(1).map((name) => truncate(name, 20)),
        3,
        { type: 'disjunction' },
      )},`,
    // "surgiu de $ORIGEM" - up to 37 characters
    vegetable.origin && ` surgiu de ${truncate(vegetable.origin, 25)}.`,
    // "Plantamos ele através de $METODO1, $METODO2 ou $METODO3" - 26 + 3 * (15 + 3) = up to 80 characters
    vegetable.planting_methods.length > 0 &&
      ` Plantamos ${gender.pronoun(vegetable.gender || 'NEUTRO')} através de ${semanticListItems(
        vegetable.planting_methods.map((method) =>
          truncate(PLANTING_METHOD_TO_LABEL[method].toLowerCase(), 15),
        ),
        3,
        { type: 'disjunction' },
      )}`,
    // ", se desenvolvendo no estrato $ESTRATO / nos estratos $ESTRATO1, $ESTRATO2 e $ESTRATO3" - 33 + 3 * (15 + 3) = up to 87 characters
    vegetable.strata.length > 0 &&
      `, se desenvolvendo no${vegetable.strata.length > 1 ? 's' : ''} estrato${vegetable.strata.length > 1 ? 's' : ''} ${semanticListItems(
        vegetable.strata.map((stratum) =>
          truncate(STRATUM_TO_LABEL[stratum].toLowerCase(), 15),
        ),
        3,
      )}.`,
    // "Ele se dá bem em consórcios com $AMIGUES"
    vegetable.friends.length > 0 &&
      ` ${capitalize(gender.pronoun(vegetable.gender || 'NEUTRO'))} se dá bem em consórcios com ${semanticListItems(
        vegetable.friends.map((friend) => friend.name),
        3,
      )}.`,
    // "Suas variedades incluem o $VARIEDADE1, $VARIEDADE2 e $VARIEDADE3" - 28 + 3 * (20 + 3) = up to 97 characters
    vegetable.varieties.length > 0 &&
      ` Suas variedades incluem ${gender.article(vegetable.gender || 'NEUTRO')} ${semanticListItems(
        vegetable.varieties.map((variety) =>
          truncate(variety.names[0].trim(), 20),
        ),
        3,
      )}.`,
  ]
    .filter(Boolean)
    .join('')

  // 62 characters + link
  const readCTA = `Mais sobre como plantar agroecologicamente e cozinhar ${gender.pronoun(vegetable.gender || 'NEUTRO')} em: ${pathToAbsUrl(paths.vegetable(vegetable.handle), true)} `

  // @TODO: find way to include contribution CTA without hitting character limit
  // const contributeCTA = `Viu alguma informação errada ou faltando? O Gororobas é colaborativo, manda sua sugestão pra gente: ${pathToAbsUrl(paths.editVegetable(vegetable.handle), true)}`

  // 22 characters
  const hashtags = '#Agroecologia #Plantar'

  // Up to 459 + 62 + 22 = 543 characters
  const message = [mainMessage, readCTA, hashtags].filter(Boolean).join('\n\n')

  return {
    message,
    images: vegetable.photos.slice(0, 3),
  }
}

/** @TODO: character limits sometimes being hit */
const createResourcePost = (
  resource: ContentToPostData['resources'][number],
): Bluesky.BlueskyPostInput => {
  const hashtags = `${resource.tags.map((tag) => stringToHashtag(tag.names[0])).join(' ')} #Agroecologia`

  // Up to 278 characters, plus link
  const parts = [
    // Up to 102 characters
    `${truncate(resource.title, 50)}\n${truncate(RESOURCE_FORMAT_TO_LABEL[resource.format], 20)} ${resource.credit_line ? `por ${truncate(resource.credit_line, 30)}` : ''}`,
    // Up to 153 characters
    resource.description
      ? `“${truncate(tiptapJSONtoPlainText(resource.description), 150)}”`
      : undefined,
    // Up to 25 characters (plus link)
    `${truncate(RESOURCE_FORMAT_ACTION_LABELS[resource.format], 20)} em: ${resource.url}`,
  ]

  const message = parts.filter(Boolean).join('\n\n')
  const truncatedHashtags = truncate(
    hashtags,
    Bluesky.MAX_BLUESKY_MESSAGE_LENGTH - message.length - 4,
  )

  const messageWithHashtags = [message, truncatedHashtags]
    .filter(Boolean)
    .join('\n\n')

  return {
    message: messageWithHashtags,
    images: resource.thumbnail ? [resource.thumbnail] : [],
  }
}

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

  // up to 267 characters, plus link
  const parts = [
    // Up to 204 characters
    `“${mainMessage}”`,
    // Up to 50 characters (plus link)
    note.created_by?.name &&
      `Notinha por ${truncate(note.created_by.name, 20)}, disponível em: ${pathToAbsUrl(paths.note(note.handle), true)}`,
    // 13 characters
    `#Agroecologia`,
  ]
  const message = parts.filter(Boolean).join('\n\n')

  return {
    message,
  }
}

const program = Effect.gen(function* () {
  const gel = yield* Gel.Gel
  const content = yield* gel.use((client) => {
    return contentToPostQuery.run(
      client.withConfig({ apply_access_policies: false }),
    )
  })

  // @TODO: re-enable vegetables once character limit is fixed
  const contentWithoutVegetables = {
    ...content,
    vegetables: [] as typeof content.vegetables,
  }

  yield* Effect.logDebug(`Got content to consider:`, content)
  const selectedContent = shuffleArray(
    Object.values(contentWithoutVegetables).flat(),
  )[0]
  yield* Effect.logDebug(`Selected content:`, selectedContent)

  let post: Bluesky.BlueskyPostInput | undefined
  if (selectedContent.type === 'default::Note') {
    post = createNotePost(selectedContent)
  } else if (selectedContent.type === 'default::Resource') {
    post = createResourcePost(selectedContent)
  } else if (selectedContent.type === 'default::Vegetable') {
    post = createVegetablePost(selectedContent)
  }

  if (!post) {
    return yield* Effect.fail('No post to create')
  }

  yield* Effect.logDebug(`Post to create:`, post)
  yield* Bluesky.postToBluesky(post)

  yield* Effect.logDebug(`Marking content as posted:`, post)
  yield* gel.use((client) => {
    return markContentAsPostedMutation.run(
      client.withConfig({ apply_access_policies: false }),
      {
        content_id: selectedContent.id,
        text: post.message,
      },
    )
  })
})

NodeRuntime.runMain(
  Effect.scoped(program).pipe(
    // Just in case posts go over the 300 character limit, keep trying with different ones
    // @TODO: retry logic
    // Effect.retry({ times: 3 }),
    Effect.provide(AllServices),
    Logger.withMinimumLogLevel(LogLevel.Debug),
  ),
)
