import { profileContributionsQuery } from '@/queries'
import { runQuery } from '@/services/runQuery'
import { runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import { notFound } from 'next/navigation'
import ProfileContributions from './ProfileContributions'

function getRouteData(handle: string) {
  return runServerEffect(
    pipe(
      runQuery(
        profileContributionsQuery,
        { handle },
        {
          metricsName: 'user_profile_contributions_page',
          metricsData: { handle },
        },
      ),
    ).pipe(Effect.catchAll(() => Effect.succeed(null))),
  )
}

export default async function UserContributionsPage(props: {
  params: Promise<{ handle: string }>
}) {
  const params = await props.params

  const { handle } = params

  const data = await getRouteData(handle)

  if (!data) return notFound()

  return <ProfileContributions {...data} />
}
