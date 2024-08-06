import { auth } from '@/edgedb'
import { paths } from '@/utils/urls'
import { redirect } from 'next/navigation'
import NewVegetableForm from './NewVegetableForm'

export default async function NewVegetableRoute() {
  const session = auth.getSession()

  if (!(await session.isSignedIn())) {
    redirect(paths.signinNotice(paths.newVegetable()))
  }

  return <NewVegetableForm />
}
