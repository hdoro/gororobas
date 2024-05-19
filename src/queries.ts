import e, { type $infer } from '@/edgeql'

const SOURCE_FIELDS = {
	type: true,
	origin: true,
	credits: true,
	users: true,
} as const

const imageFields = e.shape(e.Image, (image) => ({
	id: true,
	sanity_id: true,
	hotspot: true,
	crop: true,
	label: true,
	sources: SOURCE_FIELDS,
}))

const vegetableForCard = e.shape(e.Vegetable, (vegetable) => ({
	id: true,
	handle: true,
	name: vegetable.names.index(0),
	photos: (image) => ({
		...imageFields(image),

		order_by: {
			expression: image['@order_index'],
			direction: 'ASC',
			empty: e.EMPTY_LAST,
		},
	}),
}))

export type VegetableCardData = Exclude<
	$infer<typeof vegetableForCard>,
	null
>[number]

const userProfileForAvatar = e.shape(e.UserProfile, () => ({
	name: true,
	handle: true,
	photo: imageFields,
}))

const publicNotes = e.shape(e.Note, (note) => ({
	title: true,
	body: true,
	handle: true,
	published_at: true,
	types: true,

	filter: e.op(note.public, '=', true),
}))

export type NoteCardData = Exclude<$infer<typeof publicNotes>, null>[number]

export const vegetablePageQuery = e.params(
	{
		handle: e.str,
	},
	(params) =>
		e.select(e.Vegetable, (vegetable) => ({
			filter_single: e.op(vegetable.handle, '=', params.handle),

			id: true,
			names: true,
			scientific_names: true,
			handle: true,
			gender: true,
			strata: true,
			planting_methods: true,
			edible_parts: true,
			lifecycles: true,
			uses: true,
			origin: true,
			height_min: true,
			height_max: true,
			temperature_min: true,
			temperature_max: true,
			content: true,
			photos: (image) => ({
				...imageFields(image),

				order_by: {
					expression: image['@order_index'],
					direction: 'ASC',
					empty: e.EMPTY_LAST,
				},
			}),
			varieties: (variety) => ({
				handle: true,
				names: true,
				photos: (image) => ({
					...imageFields(image),

					order_by: {
						expression: image['@order_index'],
						direction: 'ASC',
						empty: e.EMPTY_LAST,
					},
				}),

				order_by: {
					expression: variety['@order_index'],
					direction: 'ASC',
					empty: e.EMPTY_LAST,
				},
			}),
			tips: (tip) => ({
				handle: true,
				subjects: true,
				content: true,
				sources: SOURCE_FIELDS,

				order_by: {
					expression: tip['@order_index'],
					direction: 'ASC',
					empty: e.EMPTY_LAST,
				},
			}),
			friends: vegetableForCard,
			sources: SOURCE_FIELDS,
		})),
)

export type VegetablePageData = Exclude<$infer<typeof vegetablePageQuery>, null>

export const wishlistedByQuery = e.params({ vegetable_id: e.uuid }, (params) =>
	e.select(e.Vegetable, (vegetable) => ({
		filter_single: e.op(vegetable.id, '=', params.vegetable_id),

		wishlisted_by: {
			status: true,
			user_profile: userProfileForAvatar,

			limit: 20,
		},
	})),
)

export type WishlistedByData = Exclude<$infer<typeof wishlistedByQuery>, null>

export const findUsersToMentionQuery = e.params(
	{
		query: e.str,
	},
	(params) =>
		e.select(e.UserProfile, (user) => ({
			filter: e.op(user.name, 'ilike', params.query),

			id: true,
			...userProfileForAvatar(user),
		})),
)

export type UsersToMentionData = Exclude<
	$infer<typeof findUsersToMentionQuery>,
	null
>

export const userWishlistQuery = e.params(
	{
		vegetable_id: e.uuid,
	},
	(params) =>
		e.select(e.UserWishlist, (wishlist) => ({
			status: true,

			filter_single: e.op(
				e.op(wishlist.user_profile, '=', e.global.current_user_profile),
				'and',
				e.op(
					wishlist.vegetable,
					'=',
					e.select(e.Vegetable, (vegetable) => ({
						filter_single: e.op(vegetable.id, '=', params.vegetable_id),
					})),
				),
			),
		})),
)

export const vegetablesForReferenceQuery = e.select(
	e.Vegetable,
	(vegetable) => ({
		id: true,
		label: vegetable.names.index(0),
		photos: (image) => ({
			...imageFields(image),

			limit: 1,
			order_by: {
				expression: image['@order_index'],
				direction: 'ASC',
				empty: e.EMPTY_LAST,
			},
		}),
	}),
)

export const profilePageQuery = e.select(e.UserProfile, (profile) => ({
	filter_single: e.op(profile.id, '=', e.global.current_user_profile.id),

	name: true,
	id: true,
	handle: true,
	location: true,
	bio: true,
	photo: imageFields,
}))

export type ProfilePageData = Exclude<$infer<typeof profilePageQuery>, null>

export const profileForNavQuery = e.select(e.UserProfile, (profile) => ({
	filter_single: e.op(profile.id, '=', e.global.current_user_profile.id),

	handle: true,
	photo: imageFields,
}))

export const homePageQuery = e.select({
	featured_vegetables: e.select(e.Vegetable, (vegetable) => ({
		...vegetableForCard(vegetable),

		filter: e.op('exists', vegetable.photos),
		limit: 12,
	})),

	profiles: e.select(e.UserProfile, (profile) => ({
		...userProfileForAvatar(profile),

		limit: 12,
	})),

	notes: e.select(e.Note, (note) => ({
		...publicNotes(note),

		limit: 12,
	})),
})

export type HomePageData = Exclude<$infer<typeof homePageQuery>, null>

export const notePageQuery = e.params(
	{
		handle: e.str,
	},
	(params) =>
		e.select(e.Note, (note) => ({
			...publicNotes(note),

			filter_single: e.op(note.handle, '=', params.handle),
			created_by: (userProfile) => ({
				...userProfileForAvatar(userProfile),
				bio: true,
			}),
		})),
)

export type NotePageData = Exclude<$infer<typeof notePageQuery>, null>
