import {
	newPhotosMutation,
	newTipsMutation,
	newVarietiesMutation,
	newVegetableMutation,
} from '@/mutations'
import { StoredImage, type VegetableForDB } from '@/schemas'
import { generateId } from '@/utils/ids'
import { slugify } from '@/utils/strings'
import * as S from '@effect/schema/Schema'
import type { Client } from 'edgedb'

export async function createVegetable(
	input: VegetableForDB,
	inputClient: Client,
) {
	const client = inputClient.withConfig({ allow_user_specified_id: true })

	return client.transaction(async (tx) => {
		// #1 CREATE ALL PHOTOS
		const allPhotos = [
			...(input.varieties || []).flatMap((v) => v?.photos || []),
			...(input.photos || []),
		].flatMap((photo) => {
			if (!S.is(StoredImage)(photo.data)) return []

			const { label, data, ...optional_properties } = photo
			return {
				id: generateId(),
				sanity_id: photo.data.storedPhotoId,
				label: label,
				optional_properties,
			}
		})

		if (allPhotos.length > 0) {
			// @TODO: upload images to Sanity
			await newPhotosMutation.run(tx, {
				photos: allPhotos,
			})
		}

		// #2 CREATE ALL VARIETIES
		const varieties = (input.varieties || []).map((v) => {
			return {
				id: generateId(),
				names: v.names,
				handle: `${input.handle}-${slugify(v.names[0])}`,
				photos: (v.photos || []).flatMap((photo) => {
					// @TODO: better way to lock IDs, probably when decoding the input
					const photoId = allPhotos.find(
						(p) =>
							p.label === photo.label ||
							p.sanity_id === photo.data?.storedPhotoId,
					)?.id
					if (!photoId) return []

					return photoId
				}),
			}
		})

		if (varieties.length > 0) {
			await newVarietiesMutation.run(tx, {
				varieties,
			})
		}

		// #3 Create all tips
		const tips = (input.tips || []).map(
			({ subjects, content, ...optional_properties }) => {
				return {
					id: generateId(),
					content,
					subjects,
					handle: `${input.handle}-${generateId()}`,
					content_links: [],
					optional_properties,
				}
			},
		)
		if (tips.length > 0) {
			await newTipsMutation.run(tx, {
				tips,
			})
		}

		// #4 Create vegetable
		await newVegetableMutation.run(tx, {
			names: input.names,
			handle: input.handle,
			scientific_names: input.scientific_names || null,
			gender: input.gender || null,
			strata: input.strata || null,
			temperature_max: input.temperature_max || null,
			temperature_min: input.temperature_min || null,
			height_max: input.height_max || null,
			height_min: input.height_min || null,
			origin: input.origin || null,
			uses: input.uses || null,
			planting_methods: input.planting_methods || null,
			edible_parts: input.edible_parts || null,
			lifecycles: input.lifecycles || null,
			content: input.content || null,
			photos: (input.photos || []).flatMap((photo) => {
				// @TODO: better way to lock IDs, probably when decoding the input
				const photoId = allPhotos.find(
					(p) =>
						p.label === photo.label ||
						p.sanity_id === photo.data?.storedPhotoId,
				)?.id
				if (!photoId) return []

				return photoId
			}),
			varieties: varieties.map((variety, order_index) => ({
				id: variety.id,
				order_index,
			})),
			tips: tips.map((tip, order_index) => ({
				id: tip.id,
				order_index,
			})),
		})
	})
}
