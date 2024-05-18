import { auth } from '@/edgedb'
import { profileForNavQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { paths } from '@/utils/urls'
import { Effect, pipe } from 'effect'
import Link from 'next/link'
import UserAvatar from './UserAvatar'
import { Button } from './ui/button'

export default async function UserNav({ signedIn }: { signedIn: boolean }) {
	const session = auth.getSession()

	if (!signedIn) {
		return (
			<>
				<div className="flex items-center gap-2 pt-2">
					<Button asChild>
						<a href={paths.signup()}>Criar conta</a>
					</Button>
					<Button asChild mode="outline">
						<a href={paths.signin()}>Entrar</a>
					</Button>
				</div>
			</>
		)
	}

	const profile = await runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => profileForNavQuery.run(session.client),
				catch: (error) => console.log(error),
			}),
			...buildTraceAndMetrics('profile_for_nav'),
			Effect.catchAll(() => Effect.succeed(null)),
		),
	)

	// @TODO auto-create User and UserProfile objects on middleware when logged-in but missing user and/or profile
	if (!profile) return null

	return (
		<Link
			href={paths.profile()}
			title="Editar perfil"
			className="cursor-pointer"
		>
			<UserAvatar
				size="sm"
				fallbackTone={Math.random() > 0.5 ? 'primary' : 'secondary'}
				user={profile}
				includeName={false}
			/>
		</Link>
	)
}
