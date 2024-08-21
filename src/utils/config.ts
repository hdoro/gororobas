export const PRODUCTION_URL = 'https://gororobas.com'
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string
export const SOURCE_CODE_URL =
  'https://github.com/hdoro/agroecology-wiki-edgedb-hackathon'

export const BRAND_COLOR = '#40794B'
export const APP_NAME = 'Gororobas'

export const VEGETABLES_PER_PAGE = 24
export const NOTES_PER_PAGE = 24

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not set')
}
