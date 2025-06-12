export const AVAILABLE_LOCALES = ['pt', 'es'] as const satisfies string[]

export type Locale = (typeof AVAILABLE_LOCALES)[number]

export const LOCALE_LABELS = {
  pt: 'Português',
  es: 'Español',
} as const satisfies Record<Locale, string>

/** For the cookie's key/name, refer to Paraglide's `cookieName` */
export const LOCALE_HEADER_KEY = 'x-gororobas-locale'
