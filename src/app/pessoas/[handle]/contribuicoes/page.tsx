import { auth } from '@/edgedb'
import { profileContributionsQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import { notFound } from 'next/navigation'
import ProfileContributions from './ProfileContributions'

function getRouteData(handle: string) {
  const session = auth.getSession()

  return runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => profileContributionsQuery.run(session.client, { handle }),
        catch: (error) => console.log(error),
      }),
      ...buildTraceAndMetrics('user_profile_contributions_page', { handle }),
    ).pipe(Effect.catchAll(() => Effect.succeed(null))),
  )
}

export default async function UserContributionsPage({
  params: { handle },
}: {
  params: { handle: string }
}) {
  const data = await getRouteData(handle)

  if (!data) return notFound()

  return <ProfileContributions {...data} />
}
