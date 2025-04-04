import type { VegetablePageData } from '@/queries'
import { imageBuilder } from '@/utils/imageBuilder'
import { PLANTING_METHOD_TO_LABEL, STRATUM_TO_LABEL } from '@/utils/labels'
import {
  capitalize,
  gender,
  semanticListItems,
  truncate,
} from '@/utils/strings'
import { pathToAbsUrl, paths } from '@/utils/urls'
import type { Metadata } from 'next'

function getDescription(vegetable: VegetablePageData) {
  const parts = [
    // "O $VEGETAL"
    capitalize(gender.article(vegetable.gender || 'NEUTRO')),
    ` ${truncate(vegetable.names[0], 30)}`,
    // ($NOME_CIENTIFICO)
    vegetable.scientific_names?.[0] &&
      ` (${truncate(vegetable.scientific_names[0], 30)})`,
    // ", também conhecido como $NOME1, $NOME2 ou $NOME3"
    vegetable.names.length > 1 &&
      `, também${vegetable.origin ? '' : 'é'} conhecid${gender.suffix(vegetable.gender || 'NEUTRO')} como ${semanticListItems(
        vegetable.names.slice(1).map((name) => truncate(name, 20)),
        3,
        { type: 'disjunction' },
      )}`,
    // ", surgiu de $ORIGEM"
    vegetable.origin && `, surgiu de ${truncate(vegetable.origin, 25)}`,
    '.',
    // "Plantamos ele através de $METODO1, $METODO2 ou $METODO3"
    vegetable.planting_methods.length > 0 &&
      ` Plantamos ${gender.pronoun(vegetable.gender || 'NEUTRO')} através de ${semanticListItems(
        vegetable.planting_methods.map((method) =>
          truncate(PLANTING_METHOD_TO_LABEL[method].toLowerCase(), 15),
        ),
        3,
        { type: 'disjunction' },
      )}`,
    // ", se desenvolvendo no estrato $ESTRATO / nos estratos $ESTRATO1, $ESTRATO2 e $ESTRATO3"
    vegetable.strata.length > 0 &&
      `${vegetable.planting_methods.length > 0 ? ', se desenvolvendo' : 'Se desenvolve'} no${vegetable.strata.length > 1 ? 's' : ''} estrato${vegetable.strata.length > 1 ? 's' : ''} ${semanticListItems(
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

  return parts.filter(Boolean).join('')
}

export default function getVegetableMetadata(
  vegetable: VegetablePageData | null,
): Metadata {
  const names = vegetable?.names || []

  if (!vegetable || names.length === 0) return {}

  const mainImage = vegetable.photos?.[0]
  return {
    title: `${names[0]} na Agroecologia | Gororobas`,
    description: getDescription(vegetable),
    alternates: {
      canonical: pathToAbsUrl(paths.vegetable(vegetable.handle)),
    },
    openGraph: {
      images: mainImage && [
        {
          url: imageBuilder
            .image({
              asset: {
                _ref: mainImage.sanity_id,
              },
              crop: mainImage.crop,
              hotspot: mainImage.hotspot,
            })
            .width(1200)
            .height(630)
            .quality(80)
            .crop('center')
            .auto('format')
            .url(),
          width: 1200,
          height: 630,
          alt: `Foto de ${names[0]} (${mainImage.label})`,
        },
        // For WhatsApp
        {
          url: imageBuilder
            .image({
              asset: {
                _ref: mainImage.sanity_id,
              },
              crop: mainImage.crop,
              hotspot: mainImage.hotspot,
            })
            .width(600)
            .height(600)
            .quality(80)
            .crop('center')
            .auto('format')
            .url(),
          width: 600,
          height: 600,
          alt: `Foto de ${names[0]} (${mainImage.label})`,
        },
      ],
    },
  }
}
