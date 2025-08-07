import { Effect, pipe } from 'effect'
import SeedlingIcon from '@/components/icons/SeedlingIcon'
import ProfilesStrip from '@/components/ProfilesStrip'
import { Text } from '@/components/ui/text'
import { client } from '@/gel'
import { m } from '@/paraglide/messages'
import { wishlistedByQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'

const fetchWishlistedBy = (vegetable_id: string) =>
  pipe(
    Effect.tryPromise({
      try: () =>
        wishlistedByQuery.run(
          client.withConfig({
            // Wishlists aren't public - we only allow reading them from the vegetable page so we can render the user list
            apply_access_policies: false,
          }),
          {
            vegetable_id,
          },
        ),
      catch: (error) => console.log(error),
    }),
    ...buildTraceAndMetrics('wishlisted_by', { vegetable_id }),
    Effect.catchAll(() => Effect.succeed(null)),
  )

export default async function WishlistedBy(props: { vegetable_id: string }) {
  const data = await runServerEffect(fetchWishlistedBy(props.vegetable_id))

  if (!data?.wishlisted_by || data.wishlisted_by.length === 0) {
    return null
  }

  const desiredBy = data.wishlisted_by.flatMap((userWishlist) =>
    userWishlist.status === 'QUERO_CULTIVAR' ? userWishlist.user_profile : [],
  )
  const plantedBy = data.wishlisted_by.flatMap((userWishlist) =>
    userWishlist.status === 'ESTOU_CULTIVANDO' ||
    userWishlist.status === 'JA_CULTIVEI'
      ? userWishlist.user_profile
      : [],
  )
  return (
    <>
      {plantedBy.length > 0 && (
        <div className="mt-10 -mr-[var(--page-padding-x)] space-y-3">
          <Text as="h2" level="h3" className="flex gap-1">
            <SeedlingIcon variant="color" className="w-[1.5em]" />
            {m.weird_slow_impala_loop()}
          </Text>
          <ProfilesStrip profiles={plantedBy} />
        </div>
      )}
      {desiredBy.length > 0 && (
        <div className="mt-10 -mr-[var(--page-padding-x)] space-y-3">
          <Text as="h2" level="h3" className="flex gap-1">
            <SeedlingIcon variant="color" className="w-[1.5em]" />
            {m.yummy_cute_panda_approve()}
          </Text>
          <ProfilesStrip profiles={desiredBy} />
        </div>
      )}
    </>
  )
}
