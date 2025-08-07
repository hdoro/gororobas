import type { Metadata } from 'next'
import { m } from '@/paraglide/messages'
import type { ProfileLayoutData } from '@/queries'
import { imageBuilder } from '@/utils/imageBuilder'
import { truncate } from '@/utils/strings'
import { paths, pathToAbsUrl } from '@/utils/urls'

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
    profile.location &&
      m.cute_slimy_pelican_lift({ firstName, location: profile.location }),
    profile.planted_count > 0 &&
      m.crazy_ornate_marlin_cuddle({ planted_count: profile.planted_count }),
    profile.desired_count > 0 &&
      m.yummy_still_eel_bloom({ desired_count: profile.desired_count }),
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
              alt: m.calm_spry_trout_hunt({ name }),
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
              alt: m.calm_spry_trout_hunt({ name }),
            },
          ]
        : undefined,
    },
  }
}
