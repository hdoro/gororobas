import ProfilesStrip from '@/components/ProfilesStrip'
import SeedlingIcon from '@/components/icons/SeedlingIcon'
import { Text } from '@/components/ui/text'
import { client } from '@/edgedb'
import { wishlistedByQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'

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
        <div className="mt-10 space-y-3">
          <Text as="h2" level="h3" className="flex gap-1">
            <SeedlingIcon variant="color" className="w-[1.5em]" />
            Quem já planta
          </Text>
          <ProfilesStrip profiles={plantedBy} />
        </div>
      )}
      {desiredBy.length > 0 && (
        <div className="mt-10 space-y-3">
          <Text as="h2" level="h3" className="flex gap-1">
            <SeedlingIcon variant="color" className="w-[1.5em]" />
            Quem quer plantar
          </Text>
          <ProfilesStrip profiles={desiredBy} />
        </div>
      )}
    </>
  )
}
