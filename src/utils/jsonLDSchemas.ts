import type { ResourceFormat } from '@/gel.interfaces'
import type { ResourceCardData } from '@/queries'
import { getImageProps } from '@/utils/getImageProps'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { paths, pathToAbsUrl } from '@/utils/urls'

const FORMAT_TO_SCHEMA_TYPE = {
  ACADEMIC_WORK: 'ScholarlyArticle',
  ORGANIZATION: 'Organization',
  ARTICLE: 'Article',
  BOOK: 'Book',
  FILM: 'Movie',
  SOCIAL_MEDIA: 'SocialMediaPosting',
  VIDEO: 'VideoObject',
  COURSE: 'Course',
  PODCAST: 'PodcastEpisode',
  DATASET: 'Dataset',
  OTHER: 'Thing',
} as const satisfies Record<ResourceFormat, string>

export function getResourceJsonLDSchema(resource: ResourceCardData) {
  const mainImageProps = resource.thumbnail
    ? getImageProps({ image: resource.thumbnail, maxWidth: 600 })
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': FORMAT_TO_SCHEMA_TYPE[resource.format],
    name: resource.title,
    description: resource.description
      ? tiptapJSONtoPlainText(resource.description)
      : undefined,
    creditText: resource.credit_line,
    url: pathToAbsUrl(paths.resource(resource.handle), true),
    sameAs: resource.url,
    mainEntityOfPage: pathToAbsUrl(paths.resource(resource.handle), true),
    keywords:
      resource.tags.length > 0
        ? resource.tags.flatMap((tag) => tag.names).join(', ')
        : undefined,
    image: mainImageProps?.src
      ? {
          '@type': 'ImageObject',
          url: mainImageProps.src,
          width: mainImageProps.width,
          height: mainImageProps.height,
        }
      : undefined,
    relatedLink:
      resource.related_vegetables.length > 0
        ? resource.related_vegetables.map((vegetable) =>
            pathToAbsUrl(paths.vegetable(vegetable.handle), true),
          )
        : undefined,
  } as const
}
