import type { ProfileLayoutData } from '@/queries'
import { imageBuilder } from '@/utils/imageBuilder'
import { truncate } from '@/utils/strings'
import { pathToAbsUrl, paths } from '@/utils/urls'
import type { Metadata } from 'next'

export default function getUserProfileMetadata(
  profile: ProfileLayoutData | null,
): Metadata {
  const name = profile?.name

  if (!name)
    return {
      robots: {
        index: false,
        follow: false,
      },
    }

  const firstName = name.split(' ')[0]
  const description = [
    profile.location && `${firstName} é de ${profile.location}`,
    profile.planted_count > 0 &&
      `está cultivando ${profile.planted_count} vegetais`,
    profile.desired_count > 0 &&
      `quer cultivar ${
        profile.desired_count > 0 ? 'outras ' : ''
      }${profile.desired_count} plantas`,
  ]
    .flatMap((p) => p || [])
    .join(',')

  const { photo } = profile
  return {
    title: `${name} | Gororobas Agroecologia`,
    description: truncate(description, 240),
    alternates: {
      canonical: pathToAbsUrl(paths.userProfile(profile.handle)),
    },
    openGraph: {
      type: 'profile',
      firstName,
      lastName: name.split(' ').slice(1).join(' '),
      username: profile.handle,
      countryName: profile.location || undefined,
      url: pathToAbsUrl(paths.userProfile(profile.handle)),
      images: photo
        ? [
            {
              url: imageBuilder
                .image({
                  asset: {
                    _ref: photo.sanity_id,
                  },
                  crop: photo.crop,
                  hotspot: photo.hotspot,
                })
                .width(1200)
                .height(630)
                .quality(80)
                .crop('center')
                .auto('format')
                .url(),
              width: 1200,
              height: 630,
              alt: `Foto de ${name}`,
            },
            // For WhatsApp
            {
              url: imageBuilder
                .image({
                  asset: {
                    _ref: photo.sanity_id,
                  },
                  crop: photo.crop,
                  hotspot: photo.hotspot,
                })
                .width(600)
                .height(600)
                .quality(80)
                .crop('center')
                .auto('format')
                .url(),
              width: 600,
              height: 600,
              alt: `Foto de ${name}`,
            },
          ]
        : undefined,
    },
  }
}
