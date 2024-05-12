import e, { type $infer } from '@/edgeql'

export const vegetablePageQuery = e.params(
	{
		handle: e.str,
	},
	(params) =>
		e.select(e.Vegetable, (vegetable) => ({
			filter_single: e.op(vegetable.handle, '=', params.handle),

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
				sanity_id: true,
				hotspot: true,
				crop: true,
				label: true,
				sourceType: true,
				source: true,
				credits: true,
				users: true,

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
					sanity_id: true,
					hotspot: true,
					crop: true,
					label: true,
					sourceType: true,
					source: true,
					credits: true,
					users: true,

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
				sourceType: true,
				source: true,
				credits: true,
				users: true,

				order_by: {
					expression: tip['@order_index'],
					direction: 'ASC',
					empty: e.EMPTY_LAST,
				},
			}),
		})),
)

export type VegetablePageData = Exclude<$infer<typeof vegetablePageQuery>, null>
