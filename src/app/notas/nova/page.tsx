import HideFooter from '@/components/HideFooter'
import { auth } from '@/edgedb'
import { getAuthRedirect, paths } from '@/utils/urls'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import NewNoteForm from './NewNoteForm'

export const metadata: Metadata = {
  title: 'Enviar nota | Gororobas',
}

export default async function ProfileRoute() {
  const session = auth.getSession()

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
