import {
	type ReferencesParam,
	upsertImagesMutation,
	type upsertSourcesMutation,
	type upsertVegetableTipsMutation,
	type upsertVegetableVarietiesMutation,
} from '@/mutations'
import type {
	ImageObjectInDB,
	SourceForDB,
	SourceInForm,
	VegetableTipForDB,
	VegetableVarietyForDBWithImages,
} from '@/schemas'
import type { Transaction } from 'edgedb/dist/transaction'
import type { DeepMutable } from 'effect/Types'
import { tiptapJSONtoPlainText } from './tiptap'
import { getStandardHandle } from './urls'

type UpsertImagesMutationParams = Parameters<typeof upsertImagesMutation.run>[1]

export async function upsertImagesInTransaction(
	input: readonly (typeof ImageObjectInDB.Type)[] | undefined | null,
	tx: Transaction,
): Promise<{ [idInForm: string]: string }> {
	const allPhotos = input || []

	if (allPhotos.length === 0) return {}
	const uniquePhotos = allPhotos.filter((photo, photoIndex, allPhotos) => {
		// If there are duplicates, give preference to the last ones in the array
		const hasDuplicate = allPhotos
			.slice(photoIndex + 1)
			.some((i) => i.id === photo.id || i.sanity_id === photo.sanity_id)

		return !hasDuplicate
	})
	const upsertedImages = await upsertImagesMutation.run(
		tx,
		imagesToParam(uniquePhotos),
	)
	/** As photos with duplicate sanity_id are removed in the upserted `uniquePhotos` above, we need to  */
	const photosIdMap = Object.fromEntries(
		allPhotos.map((photo) => {
			const upsertedImage = upsertedImages.find(
				(i) => i.id === photo.id || i.sanity_id === photo.sanity_id,
			)
			if (!upsertedImage) {
				throw new Error(
					`Image wasn't uploaded: ${photo.id}\nAborting transaction.`,
				)
			}
			return [photo.id, upsertedImage.id]
		}),
	)

	return photosIdMap
}

function imagesToParam(
	input: readonly (typeof ImageObjectInDB.Type)[] | undefined | null,
): UpsertImagesMutationParams {
	const images = input || []

	return images.reduce(
		(params, image, imageIndex) => {
			// If there are duplicates, give preference to the last ones in the array
			if (images.slice(imageIndex + 1).some((i) => i.id === image.id))
				return params

			params.images.push({
				id: image.id,
				sanity_id: image.sanity_id,
				sources: referencesInFormToParam(image.sources),
				optional_properties: {
					label: image.label,
					hotspot: image.hotspot,
					crop: image.crop,
				},
			})

			return params
		},
		{
			images: [],
		} as DeepMutable<UpsertImagesMutationParams>,
	)
}

type UpsertVegetableTipsMutationParams = Parameters<
	typeof upsertVegetableTipsMutation.run
>[1]

export function tipsToParam(
	input: readonly VegetableTipForDB[] | undefined | null,
): UpsertVegetableTipsMutationParams {
	const tips = input || []

	return tips.reduce(
		(params, tip, tipIndex) => {
			// If there are duplicates, give preference to the last ones in the array
			if (tips.slice(tipIndex + 1).some((t) => t.id === tip.id)) return params

			params.tips.push({
				id: tip.id,
				content: tip.content,
				subjects: tip.subjects as DeepMutable<typeof tip.subjects>,
				sources: referencesInFormToParam(tip.sources),
				handle:
					tip.handle ||
					getStandardHandle(
						tiptapJSONtoPlainText(tip.content) || String(tipIndex),
						tip.id,
					),
			})

			return params
		},
		{
			tips: [],
		} as DeepMutable<UpsertVegetableTipsMutationParams>,
	)
}

type UpsertVegetableVarietiesMutationParams = Parameters<
	typeof upsertVegetableVarietiesMutation.run
>[1]

export function varietiesToParam(
	input: readonly VegetableVarietyForDBWithImages[] | undefined | null,
	photosIdMap: Record<string, string>,
): UpsertVegetableVarietiesMutationParams {
	const varieties = input || []

	return varieties.reduce(
		(params, variety, tipIndex) => {
			// If there are duplicates, give preference to the last ones in the array
			if (varieties.slice(tipIndex + 1).some((t) => t.id === variety.id))
				return params

			params.varieties.push({
				id: variety.id,
				names: variety.names as unknown as string[],
				handle:
					variety.handle ||
					getStandardHandle(variety.names.join('-'), variety.id),
				photos: photosToReferences(variety.photos || [], photosIdMap),
			})

			return params
		},
		{
			varieties: [],
		} as DeepMutable<UpsertVegetableVarietiesMutationParams>,
	)
}

type UpsertSourcesMutationParams = Parameters<
	typeof upsertSourcesMutation.run
>[1]

export function sourcesToParam(
	input: readonly SourceForDB[] | undefined | null,
): UpsertSourcesMutationParams {
	const sources = input || []

	return sources.reduce(
		(params, source, sourceIndex) => {
			// If there are duplicates, give preference to the last ones in the array
			if (sources.slice(sourceIndex + 1).some((s) => s.id === source.id))
				return params

			params.sources.push({
				id: source.id,
				type: source.type,
				optional_properties: {
					comments: source.comments,
					credits: 'credits' in source ? source.credits : null,
					origin: 'origin' in source ? source.origin : null,
					users: 'userIds' in source ? source.userIds : null,
				},
			})

			return params
		},
		{
			sources: [],
		} as DeepMutable<UpsertSourcesMutationParams>,
	)
}
export function referencesInFormToParam(
	references:
		| Readonly<Pick<typeof SourceInForm.Type, 'id'>[]>
		| undefined
		| null,
): DeepMutable<ReferencesParam> {
	return (references || []).map((reference, order_index) => {
		return {
			id: reference.id,
			order_index,
		}
	})
}

export function photosToReferences(
	photos: Readonly<(typeof ImageObjectInDB.Type)[]> | undefined,
	photosIdMap: Record<string, string>,
): DeepMutable<ReferencesParam> {
	return referencesInFormToParam(
		(photos || []).map((photo) => ({
			id: photosIdMap[photo.id],
		})),
	)
}
