import ProfilesGrid from '@/components/ProfilesGrid'
import SectionTitle from '@/components/SectionTitle'
import RainbowIcon from '@/components/icons/RainbowIcon'
import { Text } from '@/components/ui/text'
import { auth, client } from '@/gel'
import { peopleIndexQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import { notFound } from 'next/navigation'

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
      <SectionTitle Icon={RainbowIcon}>Quem se envolve</SectionTitle>
      <Text level="h3" className="px-pageX font-normal">
        Cultivando sabedoria e compartilhando experiências para agroecologizar o
        mundo ✨
      </Text>
      <ProfilesGrid profiles={data} className="px-pageX mt-8" />
    </section>
  )
}
