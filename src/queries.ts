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

const sourceForCard = e.shape(e.Source, () => ({
	id: true,
	type: true,
	origin: true,
	credits: true,
	comments: true,
	users: {
		id: true,
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

export type SourceCardData = Exclude<$infer<typeof sourceForCard>, null>[number]

const imageForRendering = e.shape(e.Image, () => ({
	id: true,
	sanity_id: true,
	hotspot: true,
	crop: true,
	label: true,
	sources: sourceForCard,
}))

export type ImageForRenderingData = Exclude<
	$infer<typeof imageForRendering>,
	null
>[number]

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
	photo: (image) => ({ ...imageForRendering(image), sources: false }),
	location: true,
}))

/** Returns only public notes, by default */
const noteForCard = e.shape(e.Note, (note) => ({
	title: true,
	body: true,
	handle: true,
	published_at: true,
	types: true,
	created_by: (userProfile) => ({
		...userProfileForAvatar(userProfile),
		location: false,
	}),

	filter: e.op(note.public, '=', true),
}))

export type NoteCardData = Omit<
	Exclude<$infer<typeof noteForCard>, null>[number],
	'published_at'
> & {
	/** When sending over the wire via API routes, the Date gets serialized to an ISOString */
	published_at: Date | string
}

const vegetableVarietyForCard = e.shape(e.VegetableVariety, (variety) => ({
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
}))

export type VegetableVarietyCardData = Exclude<
	$infer<typeof vegetableVarietyForCard>,
	null
>[number]

const vegetableTipForCard = e.shape(e.VegetableTip, (tip) => ({
	handle: true,
	subjects: true,
	content: true,
	sources: sourceForCard,
}))

export type VegetableTipCardData = Exclude<
	$infer<typeof vegetableTipForCard>,
	null
>[number]

const coreVegetableData = e.shape(e.Vegetable, () => ({
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
}))

const vegetablePageShape = e.shape(e.Vegetable, (vegetable) => ({
	...coreVegetableData(vegetable),
	current_user_id: e.global.current_user_profile.id,
	photos: (image) => ({
		...imageForRendering(image),

		order_by: {
			expression: image['@order_index'],
			direction: 'ASC',
			empty: e.EMPTY_LAST,
		},
	}),
	varieties: (variety) => ({
		...vegetableVarietyForCard(variety),

		order_by: {
			expression: variety['@order_index'],
			direction: 'ASC',
			empty: e.EMPTY_LAST,
		},
	}),
	tips: (tip) => ({
		...vegetableTipForCard(tip),

		order_by: {
			expression: tip['@order_index'],
			direction: 'ASC',
			empty: e.EMPTY_LAST,
		},
	}),
	friends: vegetableForCard,
	sources: sourceForCard,
	related_notes: (note) => ({
		...noteForCard(note),

		limit: 12,
	}),
}))

export const vegetablePageQuery = e.params(
	{
		handle: e.str,
	},
	(params) =>
		e.select(e.Vegetable, (vegetable) => ({
			filter_single: e.op(vegetable.handle, '=', params.handle),

			...vegetablePageShape(vegetable),
		})),
)

export type VegetablePageData = Exclude<$infer<typeof vegetablePageQuery>, null>

const vegetableEditingShape = e.shape(e.Vegetable, (vegetable) => ({
	...coreVegetableData(vegetable),
	photos: (image) => ({
		...imageForRendering(image),

		order_by: {
			expression: image['@order_index'],
			direction: 'ASC',
			empty: e.EMPTY_LAST,
		},
	}),
	varieties: (variety) => ({
		...vegetableVarietyForCard(variety),
		id: true,

		order_by: {
			expression: variety['@order_index'],
			direction: 'ASC',
			empty: e.EMPTY_LAST,
		},
	}),
	tips: (tip) => ({
		...vegetableTipForCard(tip),
		id: true,

		order_by: {
			expression: tip['@order_index'],
			direction: 'ASC',
			empty: e.EMPTY_LAST,
		},
	}),
	friends: {
		id: true,
	},
	sources: sourceForCard,
}))

export type VegetableEditingData = Exclude<
	$infer<typeof vegetableEditingShape>,
	null
>[number]

export const vegetableEditingQuery = e.params(
	{
		handle: e.str,
	},
	(params) =>
		e.select(e.Vegetable, (vegetable) => ({
			filter_single: e.op(vegetable.handle, '=', params.handle),
			...vegetableEditingShape(vegetable),
		})),
)

export const editSuggestionPreviewQuery = e.params(
	{
		suggestion_id: e.uuid,
	},
	(params) =>
		e.select(e.EditSuggestion, (suggestion) => ({
			filter_single: e.op(suggestion.id, '=', params.suggestion_id),

			id: true,
			diff: true,
			status: true,
			created_at: true,
			created_by: (userProfile) => ({
				...userProfileForAvatar(userProfile),
			}),
			target_object: (vegetable) => ({
				...vegetableEditingShape(vegetable),
			}),
			can_approve: e.op(e.global.current_user.userRole, '!=', e.Role.USER),
		})),
)

export const vegetableCardsByIdQuery = e.params(
	{
		vegetable_ids: e.array(e.uuid),
	},
	(params) =>
		e.select(e.Vegetable, (vegetable) => ({
			filter: e.op(vegetable.id, 'in', e.array_unpack(params.vegetable_ids)),

			...vegetableForCard(vegetable),
		})),
)

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

export const profilesForReferenceQuery = e.select(e.UserProfile, (profile) => ({
	id: true,
	label: profile.name,
	photo: imageForRendering,
}))

export const editProfileQuery = e.select(e.UserProfile, (profile) => ({
	filter_single: e.op(profile.id, '=', e.global.current_user_profile.id),

	name: true,
	id: true,
	handle: true,
	location: true,
	bio: true,
	photo: imageForRendering,
}))

export type EditProfilePageData = Exclude<$infer<typeof editProfileQuery>, null>

export const profileForNavQuery = e.select(e.UserProfile, (profile) => ({
	filter_single: e.op(profile.id, '=', e.global.current_user_profile.id),

	handle: true,
	photo: imageForRendering,
}))

export const homePageQuery = e.select({
	featured_vegetables: e.select(e.Vegetable, (vegetable) => ({
		...vegetableForCard(vegetable),
		photos: (image) => ({
			...imageForRendering(image),

			order_by: {
				expression: image['@order_index'],
				direction: 'ASC',
				empty: e.EMPTY_LAST,
			},
			limit: 1,
		}),

		filter: e.op('exists', vegetable.photos),
		limit: 16,
	})),

	profiles: e.select(e.UserProfile, (profile) => ({
		...userProfileForAvatar(profile),

		limit: 12,
	})),

	notes: e.select(e.Note, (note) => ({
		...noteForCard(note),

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
			...noteForCard(note),
			id: true,
			created_by: (userProfile) => ({
				...userProfileForAvatar(userProfile),
				bio: true,
			}),
			is_owner: e.op(note.created_by, '=', e.global.current_user_profile),

			filter_single: e.op(note.handle, '=', params.handle),

			related_notes: (note) => ({
				...noteForCard(note),

				limit: 12,
			}),
			related_to_vegetables: vegetableForCard,
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
				...noteForCard(note),
				created_by: false,

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

export type UserProfilePageData = Exclude<
	$infer<typeof userProfilePageQuery>,
	null
>

export const currentUserQuery = e.select(e.UserProfile, (profile) => ({
	filter_single: e.op(profile.id, '=', e.global.current_user_profile.id),
}))

export const vegetablesIndexQuery = e.params(
	{
		strata: e.optional(e.array(e.str)),
		planting_methods: e.optional(e.array(e.str)),
		edible_parts: e.optional(e.array(e.str)),
		lifecycles: e.optional(e.array(e.str)),
		uses: e.optional(e.array(e.str)),
		offset: e.int32,
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
				offset: params.offset,
				order_by: [
					{
						expression: e.count(vegetable.photos),
						direction: e.DESC,
						empty: e.EMPTY_LAST,
					},
					{
						expression: vegetable.handle,
						direction: e.ASC,
					},
				],
			}
		}),
)

export type VegetablesIndexData = Exclude<
	$infer<typeof vegetablesIndexQuery>,
	null
>

export type VegetablesIndexQueryParams = Pick<
	Parameters<typeof vegetablesIndexQuery.run>[1],
	'offset'
> & {
	strata?: Stratum[] | null
	planting_methods?: PlantingMethod[] | null
	edible_parts?: EdiblePart[] | null
	lifecycles?: VegetableLifeCycle[] | null
	uses?: VegetableUsage[] | null
}

export type VegetablesIndexFilterParams = Omit<
	VegetablesIndexQueryParams,
	'offset'
>

export const notesIndexQuery = e.params(
	{
		types: e.optional(e.array(e.str)),
		offset: e.int32,
	},
	(params) =>
		e.select(e.Note, (note) => {
			return {
				...noteForCard(note),

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
				offset: params.offset,
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
	'offset'
> & {
	types?: NoteType[] | null
}

export type NotesIndexFilterParams = Omit<NotesIndexQueryParams, 'offset'>

const editSuggestionForCard = e.shape(e.EditSuggestion, () => ({
	id: true,
	created_by: userProfileForAvatar,
	created_at: true,
	diff: true,
	target_object: (vegetable) => ({
		name: vegetableForCard(vegetable).name,
		photos: (image) => ({
			...imageForRendering(image),

			order_by: {
				expression: image['@order_index'],
				direction: 'ASC',
				empty: e.EMPTY_LAST,
			},
			limit: 1,
		}),
	}),
}))

export type EditSuggestionCardData = Omit<
	Exclude<$infer<typeof editSuggestionForCard>, null>[number],
	'target_object'
> &
	// target_object is optional, and is not used in `editHistoryQuery`
	Partial<
		Pick<
			Exclude<$infer<typeof editSuggestionForCard>, null>[number],
			'target_object'
		>
	>

export const editHistoryQuery = e.params(
	{
		vegetable_id: e.uuid,
	},
	(params) =>
		e.select(e.EditSuggestion, (suggestion) => ({
			filter: e.op(
				e.op(suggestion.target_object.id, '=', params.vegetable_id),
				'and',
				e.op(suggestion.status, '=', e.EditSuggestionStatus.MERGED),
			),

			...editSuggestionForCard(suggestion),
			target_object: false,
		})),
)

export const pendingSuggestionsIndexQuery = e.select(
	e.EditSuggestion,
	(suggestion) => ({
		filter: e.op(suggestion.status, '=', e.EditSuggestionStatus.PENDING_REVIEW),
		order_by: {
			expression: suggestion.created_at,
			direction: e.ASC, // older suggestions first
			empty: e.EMPTY_FIRST,
		},

		...editSuggestionForCard(suggestion),
	}),
)
