import { BASE_URL, PRODUCTION_URL, SIGNIN_URL, SIGNUP_URL } from './config'
import { slugify, truncate } from './strings'

export function pathToAbsUrl(
	path?: string,
	forceProduction = false,
): string | undefined {
	if (typeof path !== 'string') return

	return (
		(forceProduction ? PRODUCTION_URL : BASE_URL) +
		// When creating absolute URLs, ensure the homepage doesn't have a trailing slash
		(path === '/' ? '' : formatPath(path))
	)
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
	profile: () => '/perfil' as const,
	signinNotice: () => '/entrar' as const,
	signin: () => SIGNIN_URL,
	signup: () => SIGNUP_URL,
	vegetablesIndex: () => '/vegetais' as const,
	vegetable: (handle: string) => formatPath(`/vegetais/${handle}`),
	editVegetable: (handle: string) => formatPath(`/vegetais/${handle}/editar`),
	notesIndex: () => '/notas' as const,
	note: (handle: string) => formatPath(`/notas/${handle}`),
	newNote: () => '/notas/nova' as const,
} as const

export function getAuthRedirect(isSignedIn: boolean) {
	if (!isSignedIn) return paths.signinNotice()

	return paths.profile()
}

export function getStandardHandle(textContent: string, id: string) {
	return slugify(`${truncate(textContent, 20)} ${id.slice(0, 6)}`)
}
