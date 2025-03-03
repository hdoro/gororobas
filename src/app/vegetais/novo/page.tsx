import { auth } from '@/gel'
import { paths } from '@/utils/urls'
import { redirect } from 'next/navigation'
import NewVegetableForm from './NewVegetableForm'

export default async function NewVegetableRoute() {
  const session = await auth.getSession()

  if (!(await session.isSignedIn())) {
    redirect(paths.signInOrSignUp(paths.newVegetable()))
  }

  return <NewVegetableForm />
}
