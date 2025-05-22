import 'server-only'

import {
  type Locale,
  assertIsLocale,
  baseLocale,
  overwriteGetLocale,
  overwriteGetUrlOrigin,
} from '@/paraglide/runtime'
import type { UsersToMentionData } from '@/queries'
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
export async function configureRequestLocale() {
  const locale = (await headers()).get('x-gororobas-locale') as Locale
  ssrLocale().locale = locale

  return locale
}

/**
 * Emails don't run from user interaction, so we don't have the locale headers to rely on such as in `configureRequestLocale`.
 * Instead, we need user data
 * @TODO implement `user` strategy (unsure about API)
 */
export async function configureBackgroundTaskLocale(
  props:
    | {
        strategy: 'fixed'
        locale: Locale
      }
    | { strategy: 'user'; user: UsersToMentionData }
    | { strategy: 'default' },
) {
  let locale: Locale = baseLocale
  if (props.strategy === 'fixed') {
    locale = props.locale
  }

  ssrLocale().locale = locale

  return locale
}
