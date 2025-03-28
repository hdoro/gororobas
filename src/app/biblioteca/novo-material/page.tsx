import { auth } from '@/gel'
import { paths } from '@/utils/urls'
import { redirect } from 'next/navigation'
import NewResourceForm from './NewResourceForm'

export default async function NewResourceRoute() {
  const session = await auth.getSession()

  if (!(await session.isSignedIn())) {
    redirect(paths.signInOrSignUp(paths.newResource()))
  }

  return <NewResourceForm />
}
