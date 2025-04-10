'use client'

import { overwriteGetLocale } from '@/paraglide/runtime'
import type { Locale } from '@/utils/i18n'

/**
 * Because of how NextJS handles server and client components differently,
 * `overwriteGetLocale` in `layout.tsx` has no effect for client components down the tree.
 *
 * From what I could understand, it's as if there are two different runtimes, each with a
 * different instantiation of the `paraglide/runtime.js` module. As such, overwriting the
 * `getLocale` function in one doesn't modify the other.
 */
export const LocaleInjection = (props: { locale: Locale }) => {
  if (props?.locale) overwriteGetLocale(() => props.locale)

  return null
}
