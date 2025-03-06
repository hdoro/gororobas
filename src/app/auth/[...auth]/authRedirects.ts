import { PathSchema } from '@/schemas'
import { paths } from '@/utils/urls'
import { Schema } from 'effect'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'gororobas--auth-redirect'

export async function setAuthRedirectCookie(redirectTo?: unknown) {
  try {
    const parsedRedirectTo = Schema.decodeUnknownSync(PathSchema)(redirectTo)

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, parsedRedirectTo)
  } catch (error) {}
}

export async function getAuthRedirectCookie() {
  try {
    const cookieStore = await cookies()
    const redirectTo = cookieStore.get(COOKIE_NAME)?.value

    return Schema.decodeUnknownSync(PathSchema)(redirectTo)
  } catch (error) {
    return paths.home()
  }
}

export async function clearAuthRedirectCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
