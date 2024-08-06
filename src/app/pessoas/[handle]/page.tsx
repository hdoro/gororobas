import { auth } from '@/edgedb'
import { userProfilePageQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import UserProfilePage from './UserProfilePage'
import getUserProfileMetadata from './getUserProfileMetadata'

function getRouteData(handle: string) {
  const session = auth.getSession()

  return runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => userProfilePageQuery.run(session.client, { handle }),
        catch: (error) => console.log(error),
      }),
      ...buildTraceAndMetrics('user_profile_page', { handle }),
    ).pipe(Effect.catchAll(() => Effect.succeed(null))),
  )
}

export async function generateMetadata({
  params,
}: {
  params: { handle: string }
}): Promise<Metadata> {
  return getUserProfileMetadata(await getRouteData(params.handle))
}

export default async function UserProfileRoute({
  params: { handle },
}: {
  params: { handle: string }
}) {
  const profile = await getRouteData(handle)

  if (!profile) return notFound()

  return <UserProfilePage profile={profile} />
}
