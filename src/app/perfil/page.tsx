import { auth } from '@/edgedb'
import { editProfileQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { getAuthRedirect, paths } from '@/utils/urls'
import { Effect, pipe } from 'effect'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export const metadata: Metadata = {
	title: 'Editar perfil | Gororobas',
}

export default async function ProfileRoute() {
	const session = auth.getSession()

	if (!(await session.isSignedIn())) {
		return redirect(getAuthRedirect(false, paths.editProfile()))
	}

	const profile = await runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => editProfileQuery.run(session.client),
				catch: (error) => console.log(error),
			}),
			...buildTraceAndMetrics('profile_page'),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)

	if (!profile) return notFound()

	return <ProfileForm profile={profile} />
}
