import { auth } from '@/edgedb'
import { profileNotesQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import { notFound } from 'next/navigation'
import ProfileNotes from './ProfileNotes'

function getRouteData(handle: string) {
  const session = auth.getSession()

  return runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => profileNotesQuery.run(session.client, { handle }),
        catch: (error) => console.log(error),
      }),
      ...buildTraceAndMetrics('user_profile_notes_page', { handle }),
    ).pipe(Effect.catchAll(() => Effect.succeed(null))),
  )
}

export default async function UserProfilePage({
  params: { handle },
}: {
  params: { handle: string }
}) {
  const data = await getRouteData(handle)

  if (!data) return notFound()

  return <ProfileNotes {...data} />
}
