import e from '@/edgeql'

export const newPhotosMutation = e.params(
	{
		photos: e.array(
			e.tuple({
				id: e.uuid,
				sanity_id: e.str,
				label: e.str,
				/** @see {PhotoInputValue['source']} */
				optional_properties: e.json,
			}),
		),
	},
	(params) =>
		e.for(e.array_unpack(params.photos), (photo) =>
			e.insert(e.Image, {
				id: photo.id,
				sanity_id: photo.sanity_id,
				label: photo.label,
				credits: e.cast(
					e.str,
					e.json_get(photo.optional_properties, 'credits'),
				),
				sourceType: e.cast(
					e.SourceType,
					e.json_get(photo.optional_properties, 'sourceType'),
				),
				source: e.cast(
					e.str,
					e.json_get(photo.optional_properties, 'sourceType'),
				),
				users: e.select(e.User, (user) => ({
					filter: e.op(
						user.id,
						'in',
						e.array_unpack(
							e.cast(
								e.array(e.uuid),
								e.json_get(photo.optional_properties, 'userIds'),
							),
						),
					),
				})),
			}),
		),
)
export const newVarietiesMutation = e.params(
	{
		varieties: e.array(
			e.tuple({
				id: e.uuid,
				names: e.array(e.str),
				handle: e.str,
				photos: e.array(e.uuid),
			}),
		),
	},
	(params) =>
		e.for(e.array_unpack(params.varieties), (variety) =>
			e.insert(e.VegetableVariety, {
				id: variety.id,
				names: variety.names,
				handle: variety.handle,
				photos: e.select(e.Image, (image) => ({
					filter: e.op(image.id, 'in', e.array_unpack(variety.photos)),
				})),
			}),
		),
)
export const newTipsMutation = e.params(
	{
		tips: e.array(
			e.tuple({
				id: e.uuid,
				handle: e.str,
				subjects: e.array(e.str),
				content: e.json,
				content_links: e.array(e.uuid),
				/** @see {PhotoInputValue['source']} */
				optional_properties: e.json,
			}),
		),
	},
	(params) =>
		e.for(e.array_unpack(params.tips), (tip) =>
			e.insert(e.VegetableTip, {
				id: tip.id,
				subjects: e.array_unpack(e.cast(e.array(e.TipSubject), tip.subjects)),
				content: tip.content,
				handle: tip.handle,
				content_links: e.select(e.WithHandle, (target) => ({
					filter: e.op(target.id, 'in', e.array_unpack(tip.content_links)),
				})),
				credits: e.cast(e.str, e.json_get(tip.optional_properties, 'credits')),
				sourceType: e.cast(
					e.SourceType,
					e.json_get(tip.optional_properties, 'sourceType'),
				),
				source: e.cast(
					e.str,
					e.json_get(tip.optional_properties, 'sourceType'),
				),
				users: e.select(e.User, (user) => ({
					filter: e.op(
						user.id,
						'in',
						e.array_unpack(
							e.cast(
								e.array(e.uuid),
								e.json_get(tip.optional_properties, 'userIds'),
							),
						),
					),
				})),
			}),
		),
)
export const newVegetableMutation = e.params(
	{
		names: e.array(e.str),
		scientific_names: e.array(e.str),
		handle: e.str,
		gender: e.Gender,
		origin: e.optional(e.str),
		strata: e.array(e.str),
		uses: e.optional(e.array(e.str)),
		edible_parts: e.optional(e.array(e.str)),
		lifecycles: e.optional(e.array(e.str)),
		planting_methods: e.optional(e.array(e.str)),
		height_min: e.optional(e.float32),
		height_max: e.optional(e.float32),
		temperature_min: e.optional(e.float32),
		temperature_max: e.optional(e.float32),
		content: e.optional(e.json),

		// Refs
		photos: e.optional(e.array(e.uuid)),
		varieties: e.optional(
			e.array(e.tuple({ id: e.uuid, order_index: e.int16 })),
		),
		tips: e.optional(e.array(e.tuple({ id: e.uuid, order_index: e.int16 }))),
	},
	(params) =>
		e.insert(e.Vegetable, {
			...params,
			strata: e.cast(e.array(e.Stratum), params.strata),
			uses: e.cast(e.array(e.VegetableUsage), params.uses),
			edible_parts: e.cast(e.array(e.EdiblePart), params.edible_parts),
			lifecycles: e.cast(e.array(e.VegetableLifeCycle), params.lifecycles),
			planting_methods: e.cast(
				e.array(e.PlantingMethod),
				params.planting_methods,
			),
			photos: e.select(e.Image, (image) => ({
				filter: e.op(image.id, 'in', e.array_unpack(params.photos)),
			})),
			varieties: e.assert_distinct(
				e.for(e.array_unpack(params.varieties), (variety) =>
					e.select(e.VegetableVariety, (v) => ({
						filter: e.op(v.id, '=', variety.id),
						// '@order_index': e.int16(1),
						// '@order_index': variety.order_index,
					})),
				),
			),
			tips: e.assert_distinct(
				e.for(e.array_unpack(params.tips), (tip) =>
					e.select(e.VegetableTip, (v) => ({
						filter: e.op(v.id, '=', tip.id),
						// '@order_index': e.int16(1),
						// '@order_index': variety.order_index,
					})),
				),
			),
		}),
)
