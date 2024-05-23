import e, { type $infer } from '@/edgeql'
import type {
	EdiblePart,
	NoteType,
	PlantingMethod,
	Stratum,
	VegetableLifeCycle,
	VegetableUsage,
	VegetableWishlistStatus,
} from './edgedb.interfaces'
import { NOTES_PER_PAGE, VEGETABLES_PER_PAGE } from './utils/config'

const sourceForRendering = e.shape(e.Source, () => ({
	id: true,
	type: true,
	origin: true,
	credits: true,
	users: {
		name: true,
		handle: true,
		photo: {
			sanity_id: true,
			hotspot: true,
			crop: true,
		},
		location: true,
	},
}))

export type SourceCardData = Exclude<
	$infer<typeof sourceForRendering>,
	null
>[number]

const imageForRendering = e.shape(e.Image, (image) => ({
	id: true,
	sanity_id: true,
	hotspot: true,
	crop: true,
	label: true,
	sources: sourceForRendering,
}))

const vegetableForCard = e.shape(e.Vegetable, (vegetable) => ({
	id: true,
	handle: true,
	name: vegetable.names.index(0),
	photos: (image) => ({
		...imageForRendering(image),

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
	photo: imageForRendering,
	location: true,
}))

const publicNotes = e.shape(e.Note, (note) => ({
	title: true,
	body: true,
	handle: true,
	published_at: true,
	types: true,

	filter: e.op(note.public, '=', true),
}))

export type NoteCardData = Omit<
	Exclude<$infer<typeof publicNotes>, null>[number],
	'published_at'
> & {
	/** When sending over the wire via API routes, the Date gets serialized to an ISOString */
	published_at: Date | string
}

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
				...imageForRendering(image),

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
					...imageForRendering(image),

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
				sources: sourceForRendering,

				order_by: {
					expression: tip['@order_index'],
					direction: 'ASC',
					empty: e.EMPTY_LAST,
				},
			}),
			friends: vegetableForCard,
			sources: sourceForRendering,
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
			...imageForRendering(image),

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
	photo: imageForRendering,
}))

export type EditProfilePageData = Exclude<$infer<typeof profilePageQuery>, null>

export const profileForNavQuery = e.select(e.UserProfile, (profile) => ({
	filter_single: e.op(profile.id, '=', e.global.current_user_profile.id),

	handle: true,
	photo: imageForRendering,
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
			id: true,
			created_by: (userProfile) => ({
				...userProfileForAvatar(userProfile),
				bio: true,
			}),
			is_owner: e.op(note.created_by, '=', e.global.current_user_profile),

			filter_single: e.op(note.handle, '=', params.handle),
		})),
)

export type NotePageData = Exclude<$infer<typeof notePageQuery>, null>

export const userProfilePageQuery = e.params(
	{
		handle: e.str,
	},
	(params) =>
		e.select(e.UserProfile, (profile) => ({
			filter_single: e.op(profile.handle, '=', params.handle),

			...userProfileForAvatar(profile),
			bio: true,
			is_owner: e.op(profile.id, '=', e.global.current_user_profile.id),

			notes: e.select(e.Note, (note) => ({
				...publicNotes(note),

				filter: e.op(
					e.op(note.created_by, '=', profile),
					'and',
					e.op(note.public, '=', true),
				),
				limit: 12,
			})),

			wishlist: e.select(e.UserWishlist, (wishlist) => ({
				status: true,
				vegetable: vegetableForCard,

				filter: e.op(
					e.op(wishlist.user_profile.id, '=', profile.id),
					'and',
					e.op(
						wishlist.status,
						'!=',
						e.cast(
							e.VegetableWishlistStatus,
							'SEM_INTERESSE' satisfies VegetableWishlistStatus,
						),
					),
				),
				limit: 20,
			})),
		})),
)

export type UserProfileageData = Exclude<
	$infer<typeof userProfilePageQuery>,
	null
>

export const vegetablesIndexQuery = e.params(
	{
		strata: e.optional(e.array(e.str)),
		planting_methods: e.optional(e.array(e.str)),
		edible_parts: e.optional(e.array(e.str)),
		lifecycles: e.optional(e.array(e.str)),
		uses: e.optional(e.array(e.str)),
		pageIndex: e.int16,
	},
	(params) =>
		e.select(e.Vegetable, (vegetable) => {
			const filters = [
				{ field: vegetable.strata, values: params.strata, type: e.Stratum },
				{
					field: vegetable.planting_methods,
					values: params.planting_methods,
					type: e.PlantingMethod,
				},
				{
					field: vegetable.edible_parts,
					values: params.edible_parts,
					type: e.EdiblePart,
				},
				{
					field: vegetable.lifecycles,
					values: params.lifecycles,
					type: e.VegetableLifeCycle,
				},
				{ field: vegetable.uses, values: params.uses, type: e.VegetableUsage },
			] as const
			const filterOps = filters.map(({ field, values, type }) =>
				e.op(
					// Either the param doesn't exist
					e.op('not', e.op('exists', values)),
					'or',
					// Or the vegetable has at least one of the values
					e.op(
						e.count(
							e.op(
								field,
								'intersect',
								e.array_unpack(e.cast(e.array(type), values)),
							),
						),
						'>',
						0,
					),
				),
			)

			const finalFilter = filterOps.reduce((finalFilter, op, index) => {
				if (finalFilter === null) return op
				return e.op(finalFilter, 'and', op)
			})

			return {
				...vegetableForCard(vegetable),
				uses: true,
				strata: true,
				planting_methods: true,
				edible_parts: true,
				lifecycles: true,

				filter: finalFilter,

				limit: VEGETABLES_PER_PAGE,
				offset: e.op(params.pageIndex, '*', VEGETABLES_PER_PAGE),
				order_by: {
					expression: e.count(vegetable.photos),
					direction: e.DESC,
					empty: e.EMPTY_LAST,
				},
			}
		}),
)

export type VegetablesIndexData = Exclude<
	$infer<typeof vegetablesIndexQuery>,
	null
>

export type VegetablesIndexQueryParams = Pick<
	Parameters<typeof vegetablesIndexQuery.run>[1],
	'pageIndex'
> & {
	strata?: Stratum[] | null
	planting_methods?: PlantingMethod[] | null
	edible_parts?: EdiblePart[] | null
	lifecycles?: VegetableLifeCycle[] | null
	uses?: VegetableUsage[] | null
}

export type VegetablesIndexFilterParams = Omit<
	VegetablesIndexQueryParams,
	'pageIndex'
>

export const notesIndexQuery = e.params(
	{
		types: e.optional(e.array(e.str)),
		pageIndex: e.int16,
	},
	(params) =>
		e.select(e.Note, (note) => {
			return {
				...publicNotes(note),

				filter: e.op(
					e.op(note.public, '=', true),
					'and',
					e.op(
						// Either the param doesn't exist
						e.op('not', e.op('exists', params.types)),
						'or',
						// Or the note has at least one of the type values
						e.op(
							e.count(
								e.op(
									note.types,
									'intersect',
									e.array_unpack(e.cast(e.array(e.NoteType), params.types)),
								),
							),
							'>',
							0,
						),
					),
				),

				limit: NOTES_PER_PAGE,
				offset: e.op(params.pageIndex, '*', NOTES_PER_PAGE),
				order_by: {
					expression: note.published_at,
					direction: e.DESC,
					empty: e.EMPTY_LAST,
				},
			}
		}),
)

export type NotesIndexData = Exclude<$infer<typeof notesIndexQuery>, null>

export type NotesIndexQueryParams = Pick<
	Parameters<typeof notesIndexQuery.run>[1],
	'pageIndex'
> & {
	types?: NoteType[] | null
}

export type NotesIndexFilterParams = Omit<NotesIndexQueryParams, 'pageIndex'>
