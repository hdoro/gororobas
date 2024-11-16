import { auth } from '@/edgedb'
import { profileGalleryQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { shuffleArray } from '@/utils/arrays'
import { Effect, pipe } from 'effect'
import { notFound } from 'next/navigation'
import ProfileGallery from './ProfileGallery'

function getRouteData(handle: string) {
  const session = auth.getSession()

  return runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => profileGalleryQuery.run(session.client, { handle }),
        catch: (error) => console.log(error),
      }),
      ...buildTraceAndMetrics('user_profile_gallery_page', { handle }),
    ).pipe(Effect.catchAll(() => Effect.succeed(null))),
  )
}

export default async function UserGalleryPage({
  params: { handle },
}: {
  params: { handle: string }
}) {
  const data = await getRouteData(handle)

  if (!data) return notFound()

  return <ProfileGallery {...data} images={shuffleArray(data.images)} />
}
