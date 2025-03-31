import Negotiator from 'negotiator'
import type { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export const AVAILABLE_LOCALES = ['pt', 'es'] as const satisfies string[]

export type Locale = (typeof AVAILABLE_LOCALES)[number]

export function getBrowserPreferredLocale(request: NextRequest) {
  const negotiator = new Negotiator({
    headers: Object.fromEntries(request.headers.entries()),
  })
  return negotiator.language(AVAILABLE_LOCALES) || AVAILABLE_LOCALES[0]
}

function isValidLocale(locale: unknown): locale is Locale {
  return (
    typeof locale === 'string' && AVAILABLE_LOCALES.includes(locale as Locale)
  )
}

export function getCurrentLocaleCookie(
  cookiesStore: RequestCookies | ReadonlyRequestCookies,
) {
  const preference = cookiesStore.get('gororobas--locale')?.value

  return isValidLocale(preference) ? preference : null
}

export async function getUserLocale() {
  const cookieStore = await cookies()

  return getCurrentLocaleCookie(cookieStore) || AVAILABLE_LOCALES[0]
}
