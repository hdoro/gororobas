import createUserProfile from '@/app/auth/[...auth]/createUserProfile'
import { auth } from '@/edgedb'
import { profileForNavQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import ProfileCard from './ProfileCard'
import { Button } from './ui/button'

export default async function UserNav({ signedIn }: { signedIn: boolean }) {
  const session = auth.getSession()

  if (!signedIn) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button asChild mode="outline" size="sm">
            <a href={auth.getBuiltinUIUrl()}>Entrar</a>
          </Button>
          <Button asChild size="sm">
            <a href={auth.getBuiltinUISignUpUrl()}>Criar conta</a>
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

  if (!profile) {
    await runServerEffect(createUserProfile(true))
    return null
  }

  return (
    <ProfileCard
      size="sm"
      fallbackTone={Math.random() > 0.5 ? 'primary' : 'secondary'}
      profile={profile}
      includeName={false}
    />
  )
}
