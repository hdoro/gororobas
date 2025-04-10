export const AVAILABLE_LOCALES = ['pt', 'es'] as const satisfies string[]

export type Locale = (typeof AVAILABLE_LOCALES)[number]
