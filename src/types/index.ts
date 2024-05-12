import type { Image } from '@/edgedb.interfaces'
import type {
  EDIBLE_PART_TO_LABEL,
  GENDER_TO_LABEL,
  PLANTING_METHOD_TO_LABEL,
  SOURCE_TYPE_TO_LABEL,
  STRATUM_TO_LABEL,
  TIP_SUBJECT_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import type {
  SanityImageCrop,
  SanityImageHotspot,
} from '@sanity/image-url/lib/types/types'

export type VegetableUsage = keyof typeof USAGE_TO_LABEL
export type Stratum = keyof typeof STRATUM_TO_LABEL
export type VegetableEdiblePart = keyof typeof EDIBLE_PART_TO_LABEL
export type VegetableLifecycle = keyof typeof VEGETABLE_LIFECYCLE_TO_LABEL
export type PlantingMethod = keyof typeof PLANTING_METHOD_TO_LABEL
export type SourceType = keyof typeof SOURCE_TYPE_TO_LABEL
export type Gender = keyof typeof GENDER_TO_LABEL
export type TipSubject = keyof typeof TIP_SUBJECT_TO_LABEL

export type FormOption = {
  value: string
  label: string
  description?: string
}

export type ImageForRendering = Pick<Image, 'sanity_id' | 'label'> & {
  hotspot?: SanityImageHotspot | any
  crop?: SanityImageCrop | any
}
