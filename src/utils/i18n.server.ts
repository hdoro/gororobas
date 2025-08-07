import 'server-only'

import { cookies, headers } from 'next/headers'
import { cache } from 'react'
import {
  assertIsLocale,
  baseLocale,
  cookieName,
  isLocale,
  type Locale,
  overwriteGetLocale,
  overwriteGetUrlOrigin,
} from '@/paraglide/runtime'
import type { UsersToMentionData } from '@/queries'
import { BASE_URL } from './config'
import { LOCALE_HEADER_KEY } from './i18n'

export const ssrLocale = cache(() => ({
  locale: baseLocale,
  origin: new URL(BASE_URL).origin,
}))

// overwrite the getLocale function to use the locale from the request
overwriteGetLocale(() => {
  try {
    return assertIsLocale(ssrLocale().locale)
  } catch (_error) {
    return baseLocale
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
 * This is also used in route handlers, such as `api/select-locale/route.ts`
 *
 * For client components, refer to `LocaleInjection.tsx`.
 */
export async function configureRequestLocale(
  request?: Request,
): Promise<Locale> {
  const localeFromHeaderNextAPI = (await headers()).get(
    LOCALE_HEADER_KEY,
  ) as Locale

  if (isLocale(localeFromHeaderNextAPI)) {
    ssrLocale().locale = localeFromHeaderNextAPI
    return localeFromHeaderNextAPI
  }

  const cookieStore = await cookies()
  const localeFromCookie = cookieStore.get(cookieName)

  if (isLocale(localeFromCookie)) {
    ssrLocale().locale = localeFromCookie
    return localeFromCookie
  }

  if (!request) return baseLocale

  const localeFromHeaderRequest = request.headers.get(LOCALE_HEADER_KEY)
  if (isLocale(localeFromHeaderRequest)) {
    ssrLocale().locale = localeFromHeaderRequest
    return localeFromHeaderRequest
  }

  return baseLocale
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
