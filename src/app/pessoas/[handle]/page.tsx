import { auth } from '@/edgedb'
import { userProfilePageQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import { notFound } from 'next/navigation'
import UserProfilePage from './UserProfilePage'

export default async function UserProfileRoute({
	params: { handle },
}: {
	params: { handle: string }
}) {
	const session = auth.getSession()

	const profile = await runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => userProfilePageQuery.run(session.client, { handle }),
				catch: (error) => console.log(error),
			}),
			...buildTraceAndMetrics('user_profile_page', { handle }),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)

	if (!profile) return notFound()

	return <UserProfilePage profile={profile} />
}
