import { Effect, pipe } from 'effect'
import { notFound } from 'next/navigation'
import RainbowIcon from '@/components/icons/RainbowIcon'
import ProfilesGrid from '@/components/ProfilesGrid'
import SectionTitle from '@/components/SectionTitle'
import { Text } from '@/components/ui/text'
import { auth, client } from '@/gel'
import { m } from '@/paraglide/messages'
import { peopleIndexQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'

export default async function PeopleIndexRoute() {
  const session = await auth.getSession()
  if (!(await session.isSignedIn())) {
    return notFound()
  }

  const data = await runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => peopleIndexQuery.run(client),
        catch: (error) => console.log(error),
      }),
      ...buildTraceAndMetrics('people_index'),
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )

  if (!data?.length) {
    return null
  }

  return (
    <section className="mt-12 mb-32">
      <SectionTitle Icon={RainbowIcon}>
        {m.royal_large_mayfly_stab()}
      </SectionTitle>
      <Text level="h3" className="px-pageX font-normal">
        {m.quick_dirty_mouse_twist()}
      </Text>
      <ProfilesGrid profiles={data} className="px-pageX mt-8" />
    </section>
  )
}
