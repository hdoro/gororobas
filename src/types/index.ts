import type { Image } from '@/edgedb.interfaces'
import type {
	SanityImageCrop,
	SanityImageHotspot,
} from '@sanity/image-url/lib/types/types'
export type {
	EdiblePart,
	Gender,
	PlantingMethod,
	SourceType,
	Stratum,
	TipSubject,
	VegetableLifeCycle,
	VegetableUsage,
} from '@/edgedb.interfaces'

export type FormOption = {
	value: string
	label: string
	description?: string
}

export type ImageForRendering = Pick<Image, 'sanity_id' | 'label'> & {
	hotspot?: SanityImageHotspot | unknown
	crop?: SanityImageCrop | unknown
}
