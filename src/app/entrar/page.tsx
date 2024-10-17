import { auth } from '@/edgedb'
import { getAuthRedirect, paths } from '@/utils/urls'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Entrar no Gororobas',
}

export default async function ProfileRoute({
  searchParams,
}: {
  searchParams: { redirecionar?: string }
}) {
  const session = auth.getSession()

  if (await session.isSignedIn()) {
    return redirect(getAuthRedirect(true, paths.home()))
  }

  return <LoginForm redirectTo={searchParams.redirecionar} />
}
