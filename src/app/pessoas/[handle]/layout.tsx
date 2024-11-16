import { auth } from '@/edgedb'
import { profileLayoutQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import ProfileLayout from './ProfileLayout'
import getUserProfileMetadata from './getUserProfileMetadata'

function getRouteData(handle: string) {
  const session = auth.getSession()

  return runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => profileLayoutQuery.run(session.client, { handle }),
        catch: (error) => console.log(error),
      }),
      ...buildTraceAndMetrics('user_profile_layout', { handle }),
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

export default async function UserProfileLayout({
  params: { handle },
  children,
}: PropsWithChildren<{
  params: { handle: string }
}>) {
  const profile = await getRouteData(handle)

  if (!profile) return notFound()

  return <ProfileLayout profile={profile}>{children}</ProfileLayout>
}
