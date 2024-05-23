import VegetableForm from '@/components/VegetableForm'
import { auth } from '@/edgedb'
import { paths } from '@/utils/urls'
import { redirect } from 'next/navigation'

export default async function NewVegetableRoute() {
	const session = auth.getSession()

	if (!(await session.isSignedIn())) {
		redirect(paths.signinNotice())
	}

	return <VegetableForm />
}
