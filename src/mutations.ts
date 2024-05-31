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

const upsertSourcesFragment = (
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

			return e.op(inserted, '??', updated)
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

const upsertImagesFragment = (
	images: $expr_Param<'photos', typeof PHOTOS_PARAM, false>,
) =>
	e.assert_distinct(
		e.for(e.array_unpack(images), (image) => {
			const inserted = e
				.insert(e.Image, {
					id: image.id,
					sanity_id: image.sanity_id,
					label: e.cast(e.str, e.json_get(image.optional_properties, 'label')),
					hotspot: e.cast(
						e.json,
						e.json_get(image.optional_properties, 'hotspot'),
					),
					crop: e.cast(e.json, e.json_get(image.optional_properties, 'crop')),
					sources: upsertSourcesFragment(
						// @ts-expect-error the query works, but the builder treats nested params as a different thing
						image.sources,
					),
				})
				.unlessConflict()
			const updated = e.update(e.Image, (existingImage) => ({
				filter: e.op(
					e.op(existingImage.id, '=', image.id),
					'or',
					e.op(existingImage.sanity_id, '=', image.sanity_id),
				),

				set: {
					sanity_id: e.op(image.sanity_id, '??', existingImage.sanity_id),
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
					sources: upsertSourcesFragment(
						// @ts-expect-error the query works, but the builder treats nested params as a different thing
						image.sources,
					),
				},
			}))

			return e.op(inserted, '??', updated)
		}),
	)

export const upsertVegetableMutation = e.params(
	{
		id: e.uuid,
		names: e.optional(e.array(e.str)),
		scientific_names: e.optional(e.array(e.str)),
		handle: e.optional(e.str),
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
	(params) => {
		const inserted = e
			.insert(e.Vegetable, {
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
				sources: upsertSourcesFragment(params.sources),
				photos: upsertImagesFragment(params.photos),
				varieties: e.assert_distinct(
					e.for(e.array_unpack(params.varieties), (variety) => {
						const inserted = e
							.insert(e.VegetableVariety, {
								id: variety.id,
								handle: variety.handle,
								names: variety.names,
								photos: upsertImagesFragment(params.photos),
							})
							.unlessConflict()
						const updated = e.update(e.VegetableVariety, (existingVariety) => ({
							filter_single: e.op(existingVariety.id, '=', variety.id),
							set: {
								handle: variety.handle,
								names: variety.names,
								photos: upsertImagesFragment(params.photos),
							},
						}))

						return e.op(inserted, '??', updated)
					}),
				),
				tips: e.assert_distinct(
					e.for(e.array_unpack(params.tips), (tip) => {
						const inserted = e
							.insert(e.VegetableTip, {
								id: tip.id,
								handle: tip.handle,
								subjects: e.array_unpack(
									e.cast(e.array(e.TipSubject), tip.subjects),
								),
								content: tip.content,
								sources: upsertSourcesFragment(
									// @ts-expect-error the query works, but the builder treats nested params as a different thing
									tip.sources,
								),
							})
							.unlessConflict()
						const updated = e.update(e.VegetableTip, (existingTip) => ({
							filter_single: e.op(existingTip.id, '=', tip.id),
							set: {
								handle: tip.handle,
								subjects: e.array_unpack(
									e.cast(e.array(e.TipSubject), tip.subjects),
								),
								content: tip.content,
								sources: upsertSourcesFragment(
									// @ts-expect-error the query works, but the builder treats nested params as a different thing
									tip.sources,
								),
							},
						}))

						return e.op(inserted, '??', updated)
					}),
				),
			})
			.unlessConflict()
		const updated = e.update(e.Vegetable, (existingVegetable) => ({
			filter_single: e.op(existingVegetable.id, '=', params.id),
			set: {
				// @ts-expect-error builder is parsing `params.names` as the wrong type in this scope
				names: e.op(params.names, '??', existingVegetable.names),
				// @ts-expect-error builder is parsing `params.scientific_names` as the wrong type in this scope
				scientific_names: e.op(
					// @ts-expect-error builder is parsing `params.scientific_names` as the wrong type in this scope
					params.scientific_names,
					'??',
					existingVegetable.scientific_names,
				),
				handle: e.op(params.handle, '??', existingVegetable.handle),
				gender: e.op(params.gender, '??', existingVegetable.gender),
				origin: e.op(params.origin, '??', existingVegetable.origin),
				content: e.op(params.content, '??', existingVegetable.content),
				height_min: e.op(params.height_min, '??', existingVegetable.height_min),
				height_max: e.op(params.height_max, '??', existingVegetable.height_min),
				temperature_min: e.op(
					params.temperature_min,
					'??',
					existingVegetable.temperature_min,
				),
				temperature_max: e.op(
					params.temperature_max,
					'??',
					existingVegetable.temperature_min,
				),
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
				sources: upsertSourcesFragment(params.sources),
				photos: upsertImagesFragment(params.photos),
				varieties: e.assert_distinct(
					e.for(e.array_unpack(params.varieties), (variety) => {
						const inserted = e
							.insert(e.VegetableVariety, {
								id: variety.id,
								handle: variety.handle,
								names: variety.names,
								photos: upsertImagesFragment(params.photos),
							})
							.unlessConflict()
						const updated = e.update(e.VegetableVariety, (existingVariety) => ({
							filter_single: e.op(existingVariety.id, '=', variety.id),
							set: {
								handle: variety.handle,
								names: variety.names,
								photos: upsertImagesFragment(params.photos),
							},
						}))

						return e.op(inserted, '??', updated)
					}),
				),
				tips: e.assert_distinct(
					e.for(e.array_unpack(params.tips), (tip) => {
						const inserted = e
							.insert(e.VegetableTip, {
								id: tip.id,
								handle: tip.handle,
								subjects: e.array_unpack(
									e.cast(e.array(e.TipSubject), tip.subjects),
								),
								content: tip.content,
								sources: upsertSourcesFragment(
									// @ts-expect-error the query works, but the builder treats nested params as a different thing
									tip.sources,
								),
							})
							.unlessConflict()
						const updated = e.update(e.VegetableTip, (existingTip) => ({
							filter_single: e.op(existingTip.id, '=', tip.id),
							set: {
								handle: tip.handle,
								subjects: e.array_unpack(
									e.cast(e.array(e.TipSubject), tip.subjects),
								),
								content: tip.content,
								sources: upsertSourcesFragment(
									// @ts-expect-error the query works, but the builder treats nested params as a different thing
									tip.sources,
								),
							},
						}))

						return e.op(inserted, '??', updated)
					}),
				),
			},
		}))

		return e.op(inserted, '??', updated)
	},
)
