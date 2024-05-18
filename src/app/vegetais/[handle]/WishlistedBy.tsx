import { SanityImage } from '@/components/SanityImage'
import SeedlingIcon from '@/components/icons/SeedlingIcon'
import { Text } from '@/components/ui/text'
import { client } from '@/edgedb'
import { wishlistedByQuery, type WishlistedByData } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { cn } from '@/utils/cn'
import { Effect, pipe } from 'effect'
import { SproutIcon } from 'lucide-react'

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

function AvatarsStrip({
	users,
}: { users: WishlistedByData['wishlisted_by'][number]['user_profile'][] }) {
	return (
		<div className="flex items-center gap-5 overflow-x-auto">
			{users.map((user, index) => {
				const tone = index % 2 === 0 ? 'primary' : 'secondary'
				return (
					<div key={user.name} className="flex-shrink-0 flex gap-2">
						{user.photo ? (
							<SanityImage
								image={user.photo}
								alt={`Foto de ${user.name}`}
								maxWidth={28}
								className="block w-7 h-7 object-cover rounded-full"
							/>
						) : (
							<div
								className={cn(
									'w-7 h-7 rounded-full flex items-center justify-center',
									tone === 'primary' ? 'bg-primary-200' : 'bg-secondary-200',
								)}
							>
								<SproutIcon
									className={cn(
										'w-5',
										tone === 'primary'
											? 'text-primary-700'
											: 'text-secondary-700',
									)}
								/>
							</div>
						)}
						<Text>{user.name}</Text>
					</div>
				)
			})}
		</div>
	)
}

export default async function WishlistedBy(props: {
	vegetable_id: string
}) {
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
				<div className="space-y-3 mt-10">
					<Text as="h2" level="h3" className="flex gap-1">
						<SeedlingIcon variant="color" className="w-[1.5em]" />
						Quem já planta
					</Text>
					<AvatarsStrip users={plantedBy} />
				</div>
			)}
			{desiredBy.length > 0 && (
				<div className="space-y-3 mt-10">
					<Text as="h2" level="h3" className="flex gap-1">
						<SeedlingIcon variant="color" className="w-[1.5em]" />
						Quem quer plantar
					</Text>
					<AvatarsStrip users={desiredBy} />
				</div>
			)}
		</>
	)
}
