import type { VegetablePageData } from '@/queries'
import { imageBuilder } from '@/utils/imageBuilder'
import { gender } from '@/utils/strings'
import { pathToAbsUrl, paths } from '@/utils/urls'
import type { Metadata } from 'next'

export default function getVegetableMetadata(
  vegetable: VegetablePageData | null,
): Metadata {
  const names = vegetable?.names || []

  if (!vegetable || names.length === 0) return {}

  const description = [
    `Conheça as propriedades agroecológicas ${gender.preposition(
      vegetable.gender || 'NEUTRO',
    )} ${names[0]}`,

    names.length > 1 && ` (ou ${names.slice(1).join(', ')})`,
  ]
    .flatMap((p) => p || [])
    .join('')

  const mainImage = vegetable.photos?.[0]
  return {
    title: `${names[0]} na Agroecologia | Gororobas`,
    description,
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
