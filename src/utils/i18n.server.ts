import {
  type Locale,
  assertIsLocale,
  baseLocale,
  overwriteGetLocale,
  overwriteGetUrlOrigin,
} from '@/paraglide/runtime'
import { headers } from 'next/headers'
import { cache } from 'react'
import { BASE_URL } from './config'

export const ssrLocale = cache(() => ({
  locale: baseLocale,
  origin: new URL(BASE_URL).origin,
}))

// overwrite the getLocale function to use the locale from the request
overwriteGetLocale(() => {
  console.log('\n\noverwriteGetLocale', ssrLocale().locale)
  return assertIsLocale(ssrLocale().locale)
})
overwriteGetUrlOrigin(() => ssrLocale().origin)

export async function configureServerLocale() {
  ssrLocale().locale = (await headers()).get('x-paraglide-locale') as Locale
}
