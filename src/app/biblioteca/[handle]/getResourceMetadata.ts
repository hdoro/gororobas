import type { ResourcePageData } from '@/queries'
import { imageBuilder } from '@/utils/imageBuilder'
import { truncate } from '@/utils/strings'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { pathToAbsUrl, paths } from '@/utils/urls'
import type { Metadata } from 'next'

export default function getResourceMetadata(
  resource: ResourcePageData | null,
): Metadata {
  if (!resource?.title) return {}

  const description = resource.description
    ? truncate(tiptapJSONtoPlainText(resource.description) || '', 160)
    : null

  const mainImage = resource.thumbnail || undefined
  return {
    title: `${resource.title} | Gororobas`,
    description,
    alternates: {
      canonical: pathToAbsUrl(paths.resource(resource.handle)),
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
          alt: `Foto de ${resource.title} (${mainImage.label})`,
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
          alt: `Foto de ${resource.title} (${mainImage.label})`,
        },
      ],
    },
  }
}
