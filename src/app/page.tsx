import { auth } from '@/edgedb'
import Link from 'next/link'

export default async function Home() {
	const session = auth.getSession()

	const signedIn = await session.isSignedIn()

	return (
		<div>
			<h1>Home</h1>
		</div>
	)
}
