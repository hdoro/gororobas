import { Effect, Schema } from 'effect'
import type { ContentToPostData } from '@/queries'
import * as Bluesky from '@/services/bluesky'
import { PLANTING_METHOD_TO_LABEL, STRATUM_TO_LABEL } from '@/utils/labels'
import { gender, semanticListItems, truncate } from '@/utils/strings'
import { paths, pathToAbsUrl } from '@/utils/urls'

type VegetableForPostData = ContentToPostData['vegetables'][number]

type Template = (
  vegetable: VegetableForPostData,
) => Bluesky.BlueskyPostInput | null

const TEMPLATES: Template[] = [
  // "Você sabia que o $VEGETAL (também conhecido como $NOME_2, $NOME_3 ou $NOME_4) surgiu de $ORIGEM?"
  (vegetable) => {
    if (!vegetable.origin) {
      return null
    }

    // 17 + <=50 + 24 + 3 * (<=50 + 3) + 12 + <=30 = up to 292 characters
    return {
      message: `Você sabia que ${gender.article(vegetable.gender || 'NEUTRO')} ${truncate(vegetable.name, 50)}${
        vegetable.names.length > 1
          ? ` (também conhecido como ${semanticListItems(
              vegetable.names.slice(1).map((name) => truncate(name, 50)),
              3,
              { type: 'disjunction' },
            )})`
          : ''
      } surgiu de ${truncate(vegetable.origin, 30)}?`,
    }
  },

  // "Plantamos o $VEGETAL através de $METODO1, $METODO2 ou $METODO3, se desenvolvendo no estrato $ESTRATO / nos estratos $ESTRATO1, $ESTRATO2 e $ESTRATO3"
  (vegetable) => {
    if (vegetable.planting_methods.length === 0) {
      return null
    }

    // 12 + <=50 + 12 + 3 * (<=20 + 3) + 31 + 3 * (<= 15 + 3) + 1 = up to 229 characters
    return {
      message: `Plantamos ${gender.article(vegetable.gender || 'NEUTRO')} ${truncate(vegetable.name, 50)} através de ${semanticListItems(
        vegetable.planting_methods.map((method) =>
          truncate(PLANTING_METHOD_TO_LABEL[method].toLowerCase(), 20),
        ),
        3,
        { type: 'disjunction' },
      )}, se desenvolvendo no estrato${vegetable.strata.length > 1 ? 's' : ''} ${semanticListItems(
        vegetable.strata.map((stratum) =>
          truncate(STRATUM_TO_LABEL[stratum].toLowerCase(), 15),
        ),
        3,
      )}.`,
    }
  },

  // "Entre as variedades do $VEGETAL, estão $VARIEDADE1 ($VARIEDADE1.1 ou $VARIEDADE1.2), $VARIEDADE2 e $VARIEDADE3"
  (vegetable) => {
    if (vegetable.varieties.length < 3) {
      return null
    }

    const imagesWithVarieties = [
      vegetable.photos[0],
      vegetable.varieties.flatMap((variety) => variety.photos?.[0] || []),
    ].flatMap((image) => image || [])
    return {
      images: imagesWithVarieties,
      // 23 + <=50 + 8 + 5 * ((<=50 + 2 * (<= 30 + 2)) + 3) + 1 = up to 667 characters
      message: `Entre as variedades ${gender.preposition(vegetable.gender || 'NEUTRO')} ${truncate(vegetable.name, 50)}, estão ${semanticListItems(
        vegetable.varieties.map((variety) => {
          return [
            truncate(variety.names[0], 50),
            variety.names.length > 1 &&
              `(${semanticListItems(
                variety.names.slice(1).map((name) => truncate(name, 30)),
                2,
                { type: 'disjunction' },
              )})`,
          ]
            .filter(Boolean)
            .join(' ')
        }),
        5,
        { type: 'disjunction' },
      )}.`,
    }
  },

  // "Entre outros, o $VEGETAL gosta de ser plantado em consórcio com $AMIGUE1, $AMIGUE2 e $AMIGUE3"
  (vegetable) => {
    if (vegetable.friends.length < 3) {
      return null
    }

    const imagesWithFriends = [
      vegetable.photos[0],
      vegetable.friends.flatMap((friend) => friend.photos?.[0] || []),
    ].flatMap((image) => image || [])
    // 16 + <=50 + 40 + 5 * (<=50 + 3) + 1 = up to 372 characters
    return {
      message: `Entre outros, ${gender.article(vegetable.gender || 'NEUTRO')} ${truncate(vegetable.name, 50)} gosta de ser plantado em consórcio com ${semanticListItems(
        vegetable.friends.map((friend) => truncate(friend.name, 50)),
        5,
        { type: 'disjunction' },
      )}.`,
      images: imagesWithFriends,
    }
  },
]

export const createVegetablePost = (
  vegetable: ContentToPostData['vegetables'][number],
) =>
  Effect.gen(function* () {
    const template = yield* Effect.firstSuccessOf(
      TEMPLATES.map((template) =>
        Effect.gen(function* () {
          const post = template(vegetable)
          if (!post) return yield* Effect.fail(new Error('Skip template'))

          const readCTA = `Mais sobre como plantar agroecologicamente e cozinhar ${gender.article(vegetable.gender || 'NEUTRO')} ${truncate(vegetable.name, 50)} em: ${pathToAbsUrl(paths.vegetable(vegetable.handle), true)} `
          const finalPost = {
            images: post.images || vegetable.photos.slice(0, 3),
            message: [post.message, readCTA, '#Agroecologia #Plantar']
              .filter(Boolean)
              .join('\n\n'),
          }
          return yield* Schema.decodeUnknown(Bluesky.BlueskyPostInput)(
            finalPost,
          )
        }),
      ),
    )
    if (!template) {
      return yield* Effect.fail(
        new Bluesky.BlueskyError({ message: 'No template matched' }),
      )
    }

    return template
  })
