import { auth } from '@/edgedb'
import { redirect } from 'next/navigation'

/** Simple redirect layer to allow client components to link to the login page
 * Example usage: WishlistButton's dialog point users to the log-in
 */
export const GET = (request: Request) => {
	const mode =
		new URL(request.url).searchParams.get('modo') === 'criar-conta'
			? 'signup'
			: 'login'
	redirect(
		mode === 'login' ? auth.getBuiltinUIUrl() : auth.getBuiltinUISignUpUrl(),
	)
}
