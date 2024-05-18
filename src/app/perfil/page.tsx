import { auth } from '@/edgedb'
import { profilePageQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { getAuthRedirect } from '@/utils/urls'
import { Effect, pipe } from 'effect'
import { notFound, redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfileRoute() {
	const session = auth.getSession()

	if (!(await session.isSignedIn())) {
		return redirect(getAuthRedirect(false))
	}

	const profile = await runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => profilePageQuery.run(session.client),
				catch: (error) => console.log(error),
			}),
			...buildTraceAndMetrics('profile_page'),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)

	// @TODO: this shouldn't happen - auto-create profile on middleware when logged-in but missing user and/or profile
	if (!profile) return notFound()

	return <ProfileForm profile={profile} />
}
