import { profileLayoutQuery } from '@/queries'
import { runQuery } from '@/services/runQuery'
import { runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import ProfileLayout from './ProfileLayout'
import getUserProfileMetadata from './getUserProfileMetadata'

function getRouteData(handle: string) {
  return runServerEffect(
    pipe(
      runQuery(
        profileLayoutQuery,
        { handle },
        { metricsName: 'user_profile_layout', metricsData: { handle } },
      ),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )
}

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const params = await props.params
  return getUserProfileMetadata(await getRouteData(params.handle))
}

export default async function UserProfileLayout(
  props: PropsWithChildren<{
    params: Promise<{ handle: string }>
  }>,
) {
  const params = await props.params

  const { handle } = params

  const { children } = props

  const profile = await getRouteData(handle)

  if (!profile) return notFound()

  return <ProfileLayout profile={profile}>{children}</ProfileLayout>
}
