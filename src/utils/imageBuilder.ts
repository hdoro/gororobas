import { SANITY_BASE_CONFIG } from '@/utils/sanity.client'
import ImageUrlBuilder from '@sanity/image-url'

export const imageBuilder = ImageUrlBuilder(SANITY_BASE_CONFIG)
