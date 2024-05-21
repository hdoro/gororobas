import { auth } from '@/edgedb'
import { getAuthRedirect } from '@/utils/urls'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import NoteForm from './NoteForm'
import './hideFooter.css'

export const metadata: Metadata = {
	title: 'Enviar nota | Gororobas',
}

export default async function ProfileRoute() {
	const session = auth.getSession()

	if (!(await session.isSignedIn())) {
		return redirect(getAuthRedirect(false))
	}

	return <NoteForm />
}
