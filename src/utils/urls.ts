import { BASE_URL, SIGNIN_URL, SIGNUP_URL } from './config'

export function pathToAbsUrl(path?: string): string | undefined {
	if (typeof path !== 'string') return

	return (
		BASE_URL +
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
	profile: () => '/perfil',
	signinNotice: () => '/entrar',
	signin: () => SIGNIN_URL,
	signup: () => SIGNUP_URL,
	vegetable: (handle: string) => formatPath(`/vegetais/${handle}`),
	editVegetable: (handle: string) => formatPath(`/vegetais/${handle}/editar`),
}

export function getAuthRedirect(isSignedIn: boolean) {
	if (!isSignedIn) return paths.signinNotice()

	return paths.profile()
}
