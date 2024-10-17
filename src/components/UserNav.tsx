import createUserProfile from '@/app/auth/[...auth]/createUserProfile'
import { auth } from '@/edgedb'
import { profileForNavQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { paths } from '@/utils/urls'
import { Effect, pipe } from 'effect'
import Link from 'next/link'
import ProfileCard from './ProfileCard'
import { Button } from './ui/button'

export default async function UserNav({ signedIn }: { signedIn: boolean }) {
  const session = auth.getSession()

  if (!signedIn) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button asChild mode="outline">
            <Link href={paths.signInOrSignUp(paths.home())}>Entrar</Link>
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
