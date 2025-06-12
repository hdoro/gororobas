import { m } from '@/paraglide/messages'
import type { VegetablePageData } from '@/queries'
import { imageBuilder } from '@/utils/imageBuilder'
import { PLANTING_METHOD_TO_LABEL, STRATUM_TO_LABEL } from '@/utils/labels'
import { semanticListItems, truncate } from '@/utils/strings'
import { pathToAbsUrl, paths } from '@/utils/urls'
import type { Metadata } from 'next'

function getDescription(vegetable: VegetablePageData) {
  const parts = [
    // O $NOME
    m.mad_antsy_lobster_engage({
      name: truncate(vegetable.names[0], 30),
      gender: vegetable.gender || 'NEUTRO',
    }),

    // ($NOME_CIENTIFICO)
    vegetable.scientific_names?.[0] &&
      ` (${truncate(vegetable.scientific_names[0], 30)})`,

    // ", também conhecido como $NOME1, $NOME2 ou $NOME3"
    m.sharp_wacky_nuthatch_thrive({
      alt_names: semanticListItems(
        vegetable.names.slice(1).map((name) => truncate(name, 20)),
        3,
        { type: 'disjunction' },
      ),
      gender: vegetable.gender || 'NEUTRO',
    }),

    // ", surgiu de $ORIGEM"
    vegetable.origin &&
      m.gaudy_bland_racoon_pick({ origin: truncate(vegetable.origin, 25) }),
    '. ',

    // "Plantamos ele através de $METODO1, $METODO2 ou $METODO3"
    vegetable.planting_methods.length > 0 &&
      m.wild_green_antelope_snap({
        methods: semanticListItems(
          vegetable.planting_methods.map((method) =>
            truncate(PLANTING_METHOD_TO_LABEL[method].toLowerCase(), 15),
          ),
          3,
          { type: 'disjunction' },
        ),
        gender: vegetable.gender || 'NEUTRO',
      }),
    ' ',

    // "Se desenvolve nos estratos $ESTRATO1, $ESTRATO2 e $ESTRATO3"
    vegetable.strata.length > 0 &&
      m.silly_plain_vulture_lead({
        strata: semanticListItems(
          vegetable.strata.map((stratum) =>
            truncate(STRATUM_TO_LABEL[stratum].toLowerCase(), 15),
          ),
          3,
        ),
        strata_count: vegetable.strata.length,
      }),
    ' ',

    // "Ele se dá bem em consórcios com $AMIGUES"
    vegetable.friends.length > 0 &&
      m.loose_bad_bat_ascend({
        friends: semanticListItems(
          vegetable.friends.map((friend) => friend.name),
          3,
        ),
        gender: vegetable.gender || 'NEUTRO',
      }),
    ' ',

    // "Suas variedades incluem $VARIEDADE1, $VARIEDADE2 e $VARIEDADE3" - 28 + 3 * (20 + 3) = up to 97 characters
    vegetable.varieties.length > 0 &&
      m.minor_sweet_martin_trust({
        varieties: semanticListItems(
          vegetable.varieties.map((variety) =>
            truncate(variety.names[0].trim(), 20),
          ),
          3,
        ),
      }),
  ]

  return parts.filter(Boolean).join('')
}

export default function getVegetableMetadata(
  vegetable: VegetablePageData | null,
): Metadata {
  const names = vegetable?.names || []

  if (!vegetable || names.length === 0) return {}

  const mainImage = vegetable.photos?.[0]
  const imageAltLabel = mainImage
    ? m.next_curly_weasel_build({
        name: names[0],
        image_label: mainImage.label || '0',
      })
    : undefined
  return {
    title: m.stale_only_parakeet_engage({ name: names[0] }),
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
          alt: imageAltLabel,
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
          alt: imageAltLabel,
        },
      ],
    },
  }
}
