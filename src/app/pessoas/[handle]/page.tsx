import { Effect, pipe } from 'effect'
import { notFound } from 'next/navigation'
import { profileNotesQuery } from '@/queries'
import { runQuery } from '@/services/runQuery'
import { runServerEffect } from '@/services/runtime'
import ProfileNotes from './ProfileNotes'

function getRouteData(handle: string) {
  return runServerEffect(
    pipe(
      runQuery(
        profileNotesQuery,
        { handle },
        { metricsName: 'user_profile_notes_page', metricsData: { handle } },
      ),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )
}

export default async function UserProfilePage(props: {
  params: Promise<{ handle: string }>
}) {
  const params = await props.params

  const { handle } = params

  const data = await getRouteData(handle)

  if (!data) return notFound()

  return <ProfileNotes {...data} is_owner={data.is_owner ?? false} />
}
