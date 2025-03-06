import type { NextSearchParams } from '@/types'
import type { BuiltinOAuthProviderNames } from '@gel/auth-core'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { BASE_URL, PRODUCTION_URL } from './config'
import { slugify, truncate } from './strings'

export function pathToAbsUrl<P extends string | undefined>(
  path: P,
  forceProduction = false,
): P extends string ? string : undefined {
  if (typeof path !== 'string')
    return undefined as P extends string ? string : undefined

  return ((forceProduction ? PRODUCTION_URL : BASE_URL) +
    // When creating absolute URLs, ensure the homepage doesn't have a trailing slash
    (path === '/' ? '' : formatPath(path))) as P extends string
    ? string
    : undefined
}

/**
 * Removes leading and trailing slashes from a string.
 */
export function stripMarginSlashes(path: string): string {
  if (typeof path !== 'string') return path

  return removeDoubleSlashes(path).replace(/^\/|\/$/g, '')
}

export function removeDoubleSlashes(path: string): string {
  if (typeof path !== 'string') return path

  return path.replace(/\/{2,}/g, '/')
}

/**
 * As we can't be 100% sure editors will always format their paths/slugs properly (without leading or trailing slashes),
 * we run queries against a set of possible slash variations.
 */
export function getPathVariations(path: string): string[] {
  if (typeof path !== 'string') return []

  let slashless = stripMarginSlashes(path).trim()
  if (slashless.startsWith('/')) {
    slashless = slashless.slice(1)
  }
  if (slashless.endsWith('/')) {
    slashless = slashless.slice(0, -1)
  }

  return [
    slashless,
    // /slash-on-both-ends/
    `/${slashless}/`,
    // trailing/
    `${slashless}/`,
    // /leading
    `/${slashless}`,
  ]
}

export function formatPath(path?: string): string {
  if (typeof path !== 'string') {
    return '/'
  }

  return `/${stripMarginSlashes(path)}`
}

export const paths = {
  home: () => '/' as const,

  editProfile: (isFirstTime = false) =>
    `/perfil${isFirstTime ? '?bem-vinde=true' : ''}` as const,
  userProfile: (handle: string) => formatPath(`/pessoas/${handle}`),
  userGallery: (handle: string) => formatPath(`/pessoas/${handle}/galeria`),
  userContributions: (handle: string) =>
    formatPath(`/pessoas/${handle}/contribuicoes`),
  signInOrSignUp: (onAuthRedirectTo?: string) =>
    `/entrar${onAuthRedirectTo ? `?redirecionar=${encodeURIComponent(onAuthRedirectTo)}` : ''}` as const,
  signout: () => '/auth/signout',
  oauthLogin: (
    provider: BuiltinOAuthProviderNames,
    onAuthRedirectTo?: string,
  ) =>
    `/auth/oauth?provider_name=${encodeURIComponent(provider)}${
      onAuthRedirectTo
        ? `&redirecionar=${encodeURIComponent(onAuthRedirectTo)}`
        : ''
    }`,

  vegetablesIndex: () => '/vegetais' as const,
  vegetable: (handle: string) => formatPath(`/vegetais/${handle}`),
  editVegetable: (handle: string) => formatPath(`/vegetais/${handle}/editar`),
  newVegetable: () => '/vegetais/novo' as const,
  editSuggestion: (suggestionId: string) =>
    formatPath(`/sugestoes/${suggestionId}`),

  notesIndex: () => '/notas' as const,
  note: (handle: string) => formatPath(`/notas/${handle}`),
  newNote: () => '/notas/nova' as const,
  editNote: (handle: string) => formatPath(`/notas/${handle}/editar`),
} as const

export function getAuthRedirect(isSignedIn: boolean, onAuthRedirectTo: string) {
  if (!isSignedIn) return paths.signInOrSignUp(onAuthRedirectTo)

  return paths.editProfile()
}

export function getStandardHandle(textContent: string, id: string) {
  return slugify(`${truncate(textContent, 20)}-${id.slice(0, 6)}`)
}

/**
 * Used to replace URL parameters without prompting Next to revalidate a route's data.
 */
export function persistParamsInUrl(searchParams: URLSearchParams) {
  const url = new URL(window.location.href)

  url.search = searchParams ? `?${searchParams.toString()}` : ''

  history.replaceState(
    {},
    // @ts-expect-error all major browsers ignore this parameter - the document's title does not change when navigating through history entries after running this method
    null,
    url,
  )
}

export function searchParamsToNextSearchParams(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): NextSearchParams {
  return Array.from(searchParams.entries()).reduce((acc, [key, value]) => {
    const existing = acc[key]
    if (existing) {
      if (Array.isArray(existing)) {
        acc[key] = [...existing, value]
      } else {
        acc[key] = [existing, value]
      }
    } else {
      acc[key] = value
    }
    return acc
  }, {} as NextSearchParams)
}
