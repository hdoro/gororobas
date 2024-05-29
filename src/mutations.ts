import e from '@/edgeql'
import type { $expr_Param } from './edgeql/params'
import type { BaseTypeToTsType } from './edgeql/reflection'

export const insertSourcesMutation = e.params(
	{
		sources: e.array(e.json),
	},
	(params) =>
		e.for(e.array_unpack(params.sources), (source) =>
			e
				.insert(e.Source, {
					id: e.cast(e.uuid, e.json_get(source, 'id')),
					credits: e.cast(e.str, e.json_get(source, 'credits')),
					type: e.cast(e.SourceType, e.json_get(source, 'type')),
					origin: e.cast(e.str, e.json_get(source, 'origin')),
					comments: e.cast(e.json, e.json_get(source, 'comments')),
					users: e.select(e.UserProfile, (user) => ({
						filter: e.op(
							user.id,
							'in',
							e.array_unpack(
								e.cast(e.array(e.uuid), e.json_get(source, 'userIds')),
							),
						),
					})),
				})
				.unlessConflict((existingSource) => ({
					on: existingSource.id,
					else: existingSource,
				})),
		),
)

export const insertImagesMutation = e.params(
	{
		images: e.array(
			e.tuple({
				id: e.uuid,
				sanity_id: e.str,
				label: e.str,
				sources: e.array(e.uuid),
			}),
		),
	},
	(params) =>
		e.for(e.array_unpack(params.images), (photo) =>
			e
				.insert(e.Image, {
					id: photo.id,
					sanity_id: photo.sanity_id,
					label: photo.label,
					sources: e.select(e.Source, (source) => ({
						filter: e.op(source.id, 'in', e.array_unpack(photo.sources)),
					})),
				})
				// Sanity de-duplicates images if they're uploaded multiple times,
				// so we can safely ignore conflicts
				.unlessConflict((existingImage) => ({
					on: existingImage.sanity_id,
					else: existingImage,
				})),
		),
)

export const insertVegetableFriendshipsMutation = e.params(
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
				.unlessConflict((friendship) => ({
					on: friendship.unique_key,
					else: friendship,
				})),
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
					'??',
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

const SOURCES_PARAM = e.array(
	e.tuple({
		id: e.uuid,
		type: e.SourceType,
		order_index: e.int16,
		/** { credits?: e.str, origin?: e.str, comments?: e.json, users?: e.array(e.uuid) } */
		optional_properties: e.json,
	}),
)

export type SourcesMutationInput = Readonly<
	BaseTypeToTsType<typeof SOURCES_PARAM, true>
>

const insertOrUpdateSources = (
	sources: $expr_Param<'sources', typeof SOURCES_PARAM, false>,
) =>
	e.assert_distinct(
		e.for(e.array_unpack(sources), (source) => {
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
						e.cast(e.json, e.json_get(source.optional_properties, 'comments')),
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

			const final_object = e.op(inserted, '??', updated)

			return e.with(
				[inserted, updated, final_object],
				e.select(final_object, () => ({
					id: true,
				})),
			)
		}),
	)

const PHOTOS_PARAM = e.array(
	e.tuple({
		id: e.uuid,
		sanity_id: e.str,
		sources: SOURCES_PARAM,
		order_index: e.int16,
		/** { label?: e.str, hotspot?: e.json, crop?: e.json } */
		optional_properties: e.json,
	}),
)

export type PhotosMutationInput = Readonly<
	BaseTypeToTsType<typeof PHOTOS_PARAM, true>
>

const insertOrUpdateImages = (
	images: $expr_Param<'photos', typeof PHOTOS_PARAM, false>,
) =>
	e.for(e.array_unpack(images), (photo) =>
		e
			.insert(e.Image, {
				id: photo.id,
				sanity_id: photo.sanity_id,
				label: e.cast(e.str, e.json_get(photo.optional_properties, 'label')),
				hotspot: e.cast(
					e.json,
					e.json_get(photo.optional_properties, 'hotspot'),
				),
				crop: e.cast(e.json, e.json_get(photo.optional_properties, 'crop')),
				// sources: insertOrUpdateSources(photo.sources),
			})
			.unlessConflict((existingImage) => ({
				on: existingImage.sanity_id,
				else: e.update(existingImage, () => ({
					set: {
						label: e.cast(
							e.str,
							e.json_get(photo.optional_properties, 'label'),
						),
						hotspot: e.cast(
							e.json,
							e.json_get(photo.optional_properties, 'hotspot'),
						),
						crop: e.cast(e.json, e.json_get(photo.optional_properties, 'crop')),
						// sources: insertOrUpdateSources(photo.sources),
					},
				})),
			})),
	)

export const insertVegetableMutationV2 = e.params(
	{
		id: e.uuid,
		names: e.array(e.str),
		scientific_names: e.optional(e.array(e.str)),
		handle: e.str,
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
		photos: PHOTOS_PARAM,
		sources: SOURCES_PARAM,
		varieties: e.array(
			e.tuple({
				id: e.uuid,
				names: e.array(e.str),
				handle: e.str,
				photos: PHOTOS_PARAM,
				order_index: e.int16,
			}),
		),
		tips: e.array(
			e.tuple({
				id: e.uuid,
				handle: e.str,
				subjects: e.array(e.str),
				content: e.json,
				sources: SOURCES_PARAM,
				order_index: e.int16,
			}),
		),
	},
	(params) =>
		e.insert(e.Vegetable, {
			// Primitive, root values
			...params,
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
			sources: insertOrUpdateSources(params.sources),
			photos: insertOrUpdateImages(params.photos),
			varieties: e.for(e.array_unpack(params.varieties), (variety) =>
				e
					.insert(e.VegetableVariety, {
						id: variety.id,
						handle: variety.handle,
						names: variety.names,
						photos: insertOrUpdateImages(params.photos),
					})
					.unlessConflict((existingVariety) => ({
						on: existingVariety.handle,
						else: e.update(existingVariety, () => ({
							set: {
								handle: variety.handle,
								names: variety.names,
								photos: insertOrUpdateImages(params.photos),
							},
						})),
					})),
			),
			tips: e.for(e.array_unpack(params.tips), (tip) =>
				e
					.insert(e.VegetableTip, {
						id: tip.id,
						handle: tip.handle,
						subjects: e.array_unpack(
							e.cast(e.array(e.TipSubject), tip.subjects),
						),
						content: tip.content,
						// sources: insertOrUpdateSources(tip.sources),
					})
					.unlessConflict((existingTip) => ({
						on: existingTip.handle,
						else: e.update(existingTip, () => ({
							set: {
								handle: tip.handle,
								subjects: e.array_unpack(
									e.cast(e.array(e.TipSubject), tip.subjects),
								),
								content: tip.content,
								// sources: insertOrUpdateSources(tip.sources),
							},
						})),
					})),
			),
		}),
)
