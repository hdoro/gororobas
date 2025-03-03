import { auth } from '@/gel'
import { redirect } from 'next/navigation'

/** Simple redirect layer to allow client components to link to the login page
 * Example usage: WishlistButton's dialog point users to the log-in
 */
export const GET = (request: Request) => {
  const searchParams = new URL(request.url).searchParams
  const mode = searchParams.get('modo') === 'criar-conta' ? 'signup' : 'login'

  // @TODO: implement redirecting to the correct page - probably blocked by Gel's builtin UI
  // const redirectTo = searchParams.get('redirecionar')
  redirect(
    mode === 'login' ? auth.getBuiltinUIUrl() : auth.getBuiltinUISignUpUrl(),
  )
}
