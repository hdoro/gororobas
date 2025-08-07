import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import HideFooter from '@/components/HideFooter'
import { auth } from '@/gel'
import { getAuthRedirect, paths } from '@/utils/urls'
import NewNoteForm from './NewNoteForm'

export const metadata: Metadata = {
  title: 'Enviar nota | Gororobas',
}

export default async function ProfileRoute() {
  const session = await auth.getSession()

  if (!(await session.isSignedIn())) {
    return redirect(getAuthRedirect(false, paths.newNote()))
  }

  return (
    <>
      <NewNoteForm />
      <HideFooter />
    </>
  )
}
