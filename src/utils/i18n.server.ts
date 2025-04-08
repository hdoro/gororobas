import 'server-only'

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
  try {
    return assertIsLocale(ssrLocale().locale)
  } catch (error) {
    return 'pt'
  }
})
overwriteGetUrlOrigin(() => ssrLocale().origin)

/**
 * As Next doesn't offer a sync way to access the locale, we need to run this function
 * in the root layout to get the locale message sent by the middleware via the request headers.
 *
 * Then, we overwrite the `ssrLocale` in the cache so it's accessible to any server component
 * or function down the rendering line.
 *
 * For client components, refer to `LocaleInjection.tsx`
 */
export async function configureServerLocale() {
  const locale = (await headers()).get('x-gororobas-locale') as Locale
  ssrLocale().locale = locale

  return locale
}
