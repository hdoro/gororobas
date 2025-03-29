export const PRODUCTION_URL = 'https://gororobas.com'
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string
export const SOURCE_CODE_URL = 'https://github.com/hdoro/gororobas'

export const BRAND_COLOR = '#40794B'
export const APP_NAME = 'Gororobas'

export const VEGETABLES_PER_PAGE = 24
export const NOTES_PER_PAGE = 24
export const RESOURCES_PER_PAGE = 24

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not set')
}

export const SANITY_BASE_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
  apiVersion: '2025-03-04',
  useCdn: process.env.NODE_ENV === 'production',
}
