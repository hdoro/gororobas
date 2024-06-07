import e from '@/edgeql'
import type { BaseTypeToTsType } from './edgeql/reflection'

export const upsertVegetableFriendshipsMutation = e.params(
	{
		vegetable_id: e.uuid,
		friends: e.array(
			e.tuple({
				id: e.uuid,
				unique_key: e.str,
			}),
		),
	},
	(params) =>
		e.for(e.array_unpack(params.friends), (friend) =>
			e
				.insert(e.VegetableFriendship, {
					unique_key: friend.unique_key,
					vegetables: e.select(e.Vegetable, (v) => ({
						filter: e.op(v.id, 'in', e.set(params.vegetable_id, friend.id)),
					})),
				})
				// If the friendship already exists, do nothing
				.unlessConflict(),
		),
)

export const updateWishlistStatusMutation = e.params(
	{
		vegetable_id: e.uuid,
		status: e.VegetableWishlistStatus,
	},
	(params) =>
		e
			.insert(e.UserWishlist, {
				vegetable: e.select(e.Vegetable, (v) => ({
					filter_single: e.op(v.id, '=', params.vegetable_id),
				})),
				status: params.status,
				user_profile: e.global.current_user_profile,
			})
			.unlessConflict((userWishlist) => ({
				// When there's a conflict on the composite exclusivity constraint of the wishlist (user_profile, vegetable)
				on: e.tuple([userWishlist.user_profile, userWishlist.vegetable]),
				// Simply update existing objects
				else: e.update(userWishlist, () => ({
					set: {
						status: params.status,
					},
				})),
			})),
)

export const updateProfileMutation = e.params(
	{
		name: e.optional(e.str),
		handle: e.optional(e.str),
		location: e.optional(e.str),
		photo: e.optional(e.uuid),
		bio: e.optional(e.json),
	},
	(params) =>
		e.update(e.UserProfile, (userProfile) => ({
			filter_single: e.op(
				e.global.current_user_profile.id,
				'=',
				userProfile.id,
			),
			set: {
				name: e.op(params.name, '??', userProfile.name),
				handle: e.op(params.handle, '??', userProfile.handle),
				location: e.op(params.location, '??', userProfile.location),
				bio: e.op(params.bio, '??', userProfile.bio),
				photo: e.op(
					e.select(e.Image, (image) => ({
						filter_single: e.op(image.id, '=', params.photo),
					})),
					'if',
					e.op('exists', params.photo),
					'else',
					userProfile.photo,
				),
			},
		})),
)

export const insertNotesMutation = e.params(
	{
		notes: e.array(
			e.tuple({
				id: e.uuid,
				handle: e.str,
				title: e.json,
				public: e.bool,
				published_at: e.datetime,
				types: e.array(e.str),

				/** { body: e.optional(e.json), created_by: e.uuid } */
				optional_properties: e.json,
			}),
		),
	},
	(params) =>
		e.for(e.array_unpack(params.notes), (note) => {
			const inserted = e.insert(e.Note, {
				id: note.id,
				handle: note.handle,
				title: note.title,
				body: e.cast(e.json, e.json_get(note.optional_properties, 'body')),
				public: note.public,
				types: e.array_unpack(e.cast(e.array(e.NoteType), note.types)),
				published_at: note.published_at,
				created_by: e.assert_single(
					e.select(e.UserProfile, (user_profile) => ({
						filter_single: e.op(
							user_profile.id,
							'=',
							e.op(
								e.cast(
									e.uuid,
									e.json_get(note.optional_properties, 'created_by'),
								),
								'??',
								e.global.current_user_profile.id,
							),
						),
					})),
				),
			})

			return e.select(inserted, (note) => ({
				id: true,
				handle: true,
			}))
		}),
)

export const deleteNotesMutation = e.params(
	{
		noteIds: e.array(e.uuid),
	},
	(params) =>
		e.delete(e.Note, (note) => ({
			filter: e.op(note.id, 'in', e.array_unpack(params.noteIds)),
		})),
)

export const insertEditSuggestionMutation = e.params(
	{
		snapshot: e.json,
		target_id: e.uuid,
		diff: e.json,
	},
	(params) =>
		e.insert(e.EditSuggestion, {
			status: e.EditSuggestionStatus.PENDING_REVIEW,
			target_object: e.select(e.Vegetable, (v) => ({
				filter_single: e.op(v.id, '=', params.target_id),
			})),
			diff: params.diff,
			snapshot: params.snapshot,
		}),
)

export const rejectSuggestionMutation = e.params(
	{
		suggestion_id: e.uuid,
	},
	(params) =>
		e.update(e.EditSuggestion, (suggestion) => ({
			filter_single: e.op(suggestion.id, '=', params.suggestion_id),
			set: {
				status: e.EditSuggestionStatus.REJECTED,
			},
		})),
)

export const upsertSourcesMutation = e.params(
	{
		sources: e.array(
			e.tuple({
				id: e.uuid,
				type: e.SourceType,
				/** { credits?: e.str, origin?: e.str, comments?: e.json, users?: e.array(e.uuid) } */
				optional_properties: e.json,
			}),
		),
	},
	({ sources }) =>
		e.assert_distinct(
			e.for(e.array_unpack(sources), (source) => {
				const inserted = e
					.insert(e.Source, {
						id: source.id,
						type: source.type,
						credits: e.cast(
							e.str,
							e.json_get(source.optional_properties, 'credits'),
						),
						origin: e.cast(
							e.str,
							e.json_get(source.optional_properties, 'origin'),
						),
						comments: e.cast(
							e.json,
							e.json_get(source.optional_properties, 'comments'),
						),
						users: e.select(e.UserProfile, (user) => ({
							filter: e.op(
								user.id,
								'in',
								e.array_unpack(
									e.cast(
										e.array(e.uuid),
										e.json_get(source.optional_properties, 'userIds'),
									),
								),
							),
						})),
					})
					.unlessConflict()
				const updated = e.update(e.Source, (existingSource) => ({
					filter: e.op(existingSource.id, '=', source.id),

					set: {
						credits: e.op(
							e.cast(e.str, e.json_get(source.optional_properties, 'credits')),
							'??',
							existingSource.credits,
						),
						origin: e.op(
							e.cast(e.str, e.json_get(source.optional_properties, 'origin')),
							'??',
							existingSource.origin,
						),
						comments: e.op(
							e.cast(
								e.json,
								e.json_get(source.optional_properties, 'comments'),
							),
							'??',
							existingSource.comments,
						),
						users: e.op(
							e.select(e.UserProfile, (user) => ({
								filter: e.op(
									user.id,
									'in',
									e.array_unpack(
										e.cast(
											e.array(e.uuid),
											e.json_get(source.optional_properties, 'userIds'),
										),
									),
								),
							})),
							'??',
							existingSource.users,
						),
					},
				}))

				return e.op(inserted, '??', updated)
			}),
		),
)

const REFERENCES_PARAM = e.array(
	e.tuple({
		id: e.uuid,
		order_index: e.int16,
	}),
)

export type ReferencesParam = Readonly<
	BaseTypeToTsType<typeof REFERENCES_PARAM, true>
>

export const upsertImagesMutation = e.params(
	{
		images: e.array(
			e.tuple({
				id: e.uuid,
				sanity_id: e.str,
				sources: REFERENCES_PARAM,
				/** { label?: e.str, hotspot?: e.json, crop?: e.json } */
				optional_properties: e.json,
			}),
		),
	},
	({ images }) => {
		const upserted = e.assert_distinct(
			e.for(e.array_unpack(images), (image) => {
				const inserted = e
					.insert(e.Image, {
						id: image.id,
						sanity_id: image.sanity_id,
						label: e.cast(
							e.str,
							e.json_get(image.optional_properties, 'label'),
						),
						hotspot: e.cast(
							e.json,
							e.json_get(image.optional_properties, 'hotspot'),
						),
						crop: e.cast(e.json, e.json_get(image.optional_properties, 'crop')),
						sources: e.assert_distinct(
							e.for(e.array_unpack(image.sources), (source) =>
								e.select(e.Source, (v) => ({
									filter_single: e.op(v.id, '=', source.id),
									// '@order_index': variety.order_index,
								})),
							),
						),
					})
					// If a conflict exists, it'll be updated instead
					.unlessConflict()

				const updated = e.update(e.Image, (existingImage) => ({
					filter: e.op(
						e.op(existingImage.id, '=', image.id),
						'or',
						e.op(existingImage.sanity_id, '=', image.sanity_id),
					),

					set: {
						label: e.op(
							e.cast(e.str, e.json_get(image.optional_properties, 'label')),
							'??',
							existingImage.label,
						),
						hotspot: e.op(
							e.cast(e.json, e.json_get(image.optional_properties, 'hotspot')),
							'??',
							existingImage.hotspot,
						),
						crop: e.op(
							e.cast(e.json, e.json_get(image.optional_properties, 'crop')),
							'??',
							existingImage.crop,
						),
						sources: e.assert_distinct(
							e.for(e.array_unpack(image.sources), (source) =>
								e.select(e.Source, (v) => ({
									filter_single: e.op(v.id, '=', source.id),
									// '@order_index': variety.order_index,
								})),
							),
						),
					},
				}))

				return e.op(inserted, '??', updated)
			}),
		)

		return e.select(upserted, () => ({
			id: true,
			sanity_id: true,
		}))
	},
)

export const upsertVegetableTipsMutation = e.params(
	{
		tips: e.array(
			e.tuple({
				id: e.uuid,
				handle: e.str,
				subjects: e.array(e.str),
				content: e.json,
				sources: REFERENCES_PARAM,
			}),
		),
	},
	({ tips }) =>
		e.assert_distinct(
			e.for(e.array_unpack(tips), (tip) => {
				const inserted = e
					.insert(e.VegetableTip, {
						id: tip.id,

						handle: tip.handle,
						subjects: e.array_unpack(
							e.cast(e.array(e.TipSubject), tip.subjects),
						),
						content: tip.content,
						sources: e.assert_distinct(
							e.for(e.array_unpack(tip.sources), (source) =>
								e.select(e.Source, (v) => ({
									filter_single: e.op(v.id, '=', source.id),
									// '@order_index': variety.order_index,
								})),
							),
						),
					})
					.unlessConflict()

				const updated = e.update(e.VegetableTip, (existingTip) => ({
					filter_single: e.op(existingTip.id, '=', tip.id),

					set: {
						subjects: e.array_unpack(
							e.cast(e.array(e.TipSubject), tip.subjects),
						),
						content: tip.content,
						sources: e.assert_distinct(
							e.for(e.array_unpack(tip.sources), (source) =>
								e.select(e.Source, (v) => ({
									filter_single: e.op(v.id, '=', source.id),
									// '@order_index': variety.order_index,
								})),
							),
						),
					},
				}))

				return e.op(inserted, '??', updated)
			}),
		),
)

export const upsertVegetableVarietiesMutation = e.params(
	{
		varieties: e.array(
			e.tuple({
				id: e.uuid,
				handle: e.str,
				names: e.array(e.str),
				photos: REFERENCES_PARAM,
			}),
		),
	},
	({ varieties }) =>
		e.assert_distinct(
			e.for(e.array_unpack(varieties), (variety) => {
				const inserted = e.insert(e.VegetableVariety, {
					id: variety.id,
					handle: variety.handle,
					names: variety.names,
					photos: e.assert_distinct(
						e.for(e.array_unpack(variety.photos), (image) =>
							e.select(e.Image, (v) => ({
								filter_single: e.op(v.id, '=', image.id),
								// '@order_index': variety.order_index,
							})),
						),
					),
				})
				const updated = e.update(e.VegetableVariety, (existingVariety) => ({
					filter_single: e.op(existingVariety.id, '=', variety.id),

					set: {
						names: variety.names,
						photos: e.assert_distinct(
							e.for(e.array_unpack(variety.photos), (image) =>
								e.select(e.Image, (v) => ({
									filter_single: e.op(v.id, '=', image.id),
									// '@order_index': variety.order_index,
								})),
							),
						),
					},
				}))
				return e.op(inserted, '??', updated)
			}),
		),
)

const COMMON_VEGETABLE_PARAMS = {
	id: e.uuid,
	scientific_names: e.optional(e.array(e.str)),
	gender: e.optional(e.Gender),
	origin: e.optional(e.str),
	strata: e.optional(e.array(e.str)),
	uses: e.optional(e.array(e.str)),
	edible_parts: e.optional(e.array(e.str)),
	lifecycles: e.optional(e.array(e.str)),
	planting_methods: e.optional(e.array(e.str)),
	height_min: e.optional(e.float32),
	height_max: e.optional(e.float32),
	temperature_min: e.optional(e.float32),
	temperature_max: e.optional(e.float32),
	content: e.optional(e.json),
	photos: REFERENCES_PARAM,
	sources: REFERENCES_PARAM,
	varieties: REFERENCES_PARAM,
} as const

export const insertVegetableMutation = e.params(
	{
		names: e.array(e.str),
		handle: e.str,
		...COMMON_VEGETABLE_PARAMS,
	},
	(params) =>
		e.insert(e.Vegetable, {
			id: params.id,
			names: params.names,
			scientific_names: params.scientific_names,
			handle: params.handle,
			gender: params.gender,
			origin: params.origin,
			content: params.content,
			height_min: params.height_min,
			height_max: params.height_max,
			temperature_min: params.temperature_min,
			temperature_max: params.temperature_max,
			strata: e.array_unpack(e.cast(e.array(e.Stratum), params.strata)),
			uses: e.array_unpack(e.cast(e.array(e.VegetableUsage), params.uses)),
			edible_parts: e.array_unpack(
				e.cast(e.array(e.EdiblePart), params.edible_parts),
			),
			lifecycles: e.array_unpack(
				e.cast(e.array(e.VegetableLifeCycle), params.lifecycles),
			),
			planting_methods: e.array_unpack(
				e.cast(e.array(e.PlantingMethod), params.planting_methods),
			),

			// References
			sources: e.assert_distinct(
				e.for(e.array_unpack(params.sources), (source) =>
					e.select(e.Source, (v) => ({
						filter_single: e.op(v.id, '=', source.id),
						// '@order_index': variety.order_index,
					})),
				),
			),
			photos: e.assert_distinct(
				e.for(e.array_unpack(params.photos), (image) =>
					e.select(e.Image, (v) => ({
						filter_single: e.op(v.id, '=', image.id),
						// '@order_index': variety.order_index,
					})),
				),
			),
			varieties: e.assert_distinct(
				e.for(e.array_unpack(params.varieties), (variety) =>
					e.select(e.VegetableVariety, (v) => ({
						filter_single: e.op(v.id, '=', variety.id),
						// '@order_index': variety.order_index,
					})),
				),
			),
		}),
)

export const updateVegetableMutation = e.params(
	{
		names: e.optional(e.array(e.str)),
		handle: e.optional(e.str),
		...COMMON_VEGETABLE_PARAMS,
	},
	(params) =>
		e.update(e.Vegetable, (existingVegetable) => ({
			filter_single: e.op(existingVegetable.id, '=', params.id),
			set: {
				id: params.id,
				// @ts-expect-error erroing out for some unknown reason
				names: e.op(params.names, '??', existingVegetable.names),
				// @ts-expect-error erroing out for some unknown reason
				scientific_names: e.op(
					// @ts-expect-error erroing out for some unknown reason
					params.scientific_names,
					'??',
					existingVegetable.scientific_names,
				),
				handle: e.op(params.handle, '??', existingVegetable.handle),
				gender: e.op(params.gender, '??', existingVegetable.gender),
				origin: e.op(params.origin, '??', existingVegetable.origin),
				content: e.op(params.content, '??', existingVegetable.content),
				height_min: e.op(params.height_min, '??', existingVegetable.height_min),
				height_max: e.op(params.height_max, '??', existingVegetable.height_max),
				temperature_min: e.op(
					params.temperature_min,
					'??',
					existingVegetable.temperature_min,
				),
				temperature_max: e.op(
					params.temperature_max,
					'??',
					existingVegetable.temperature_max,
				),
				strata: e.op(
					e.array_unpack(e.cast(e.array(e.Stratum), params.strata)),
					'??',
					existingVegetable.strata,
				),
				uses: e.op(
					e.array_unpack(e.cast(e.array(e.VegetableUsage), params.uses)),
					'??',
					existingVegetable.uses,
				),
				edible_parts: e.op(
					e.array_unpack(e.cast(e.array(e.EdiblePart), params.edible_parts)),
					'??',
					existingVegetable.edible_parts,
				),
				lifecycles: e.op(
					e.array_unpack(
						e.cast(e.array(e.VegetableLifeCycle), params.lifecycles),
					),
					'??',
					existingVegetable.lifecycles,
				),
				planting_methods: e.op(
					e.array_unpack(
						e.cast(e.array(e.PlantingMethod), params.planting_methods),
					),
					'??',
					existingVegetable.planting_methods,
				),

				// References
				sources: e.assert_distinct(
					e.for(e.array_unpack(params.sources), (source) =>
						e.select(e.Source, (v) => ({
							filter_single: e.op(v.id, '=', source.id),
							// '@order_index': variety.order_index,
						})),
					),
				),
				photos: e.assert_distinct(
					e.for(e.array_unpack(params.photos), (image) =>
						e.select(e.Image, (v) => ({
							filter_single: e.op(v.id, '=', image.id),
							// '@order_index': variety.order_index,
						})),
					),
				),
				varieties: e.assert_distinct(
					e.for(e.array_unpack(params.varieties), (variety) =>
						e.select(e.VegetableVariety, (v) => ({
							filter_single: e.op(v.id, '=', variety.id),
							// '@order_index': variety.order_index,
						})),
					),
				),
			},
		})),
)
