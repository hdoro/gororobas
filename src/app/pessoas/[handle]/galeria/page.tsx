import { profileGalleryQuery } from '@/queries'
import { runQuery } from '@/services/runQuery'
import { runServerEffect } from '@/services/runtime'
import { shuffleArray } from '@/utils/arrays'
import { Effect, pipe } from 'effect'
import { notFound } from 'next/navigation'
import ProfileGallery from './ProfileGallery'

function getRouteData(handle: string) {
  return runServerEffect(
    pipe(
      runQuery(
        profileGalleryQuery,
        { handle },
        { metricsName: 'user_profile_gallery_page', metricsData: { handle } },
      ),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )
}

export default async function UserGalleryPage(props: {
  params: Promise<{ handle: string }>
}) {
  const params = await props.params

  const { handle } = params

  const data = await getRouteData(handle)

  if (!data) return notFound()

  return (
    <ProfileGallery
      {...data}
      images={shuffleArray(data.images)}
      is_owner={data.is_owner ?? false}
    />
  )
}
