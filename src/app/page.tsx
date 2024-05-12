import { auth } from '@/edgedb'
import Link from 'next/link'

export default async function Home() {
	const session = auth.getSession()

	const signedIn = await session.isSignedIn()

	return (
		<div>
			<header className="absolute inset-x-0 top-0 z-50">
				<nav
					className="flex items-center justify-between p-6 lg:px-8"
					aria-label="Global"
				>
					<div className="flex flex-1 justify-end space-x-2">
						{!signedIn ? (
							<>
								<Link
									href={auth.getBuiltinUIUrl()}
									className="ring-2 ring-inset ring-primary bg-primarylight px-4 py-2 rounded-md"
								>
									Sign in
								</Link>
								<Link
									href={auth.getBuiltinUISignUpUrl()}
									className="text-sm font-semibold leading-6 bg-primary px-4 py-2 rounded-md text-white"
								>
									Sign up
								</Link>
							</>
						) : (
							<Link
								href="dashboard"
								className="text-sm font-semibold leading-6 bg-primary px-4 py-2 rounded-md text-white"
							>
								Dashboard
							</Link>
						)}
					</div>
				</nav>
			</header>
			<h1>Homepage</h1>
		</div>
	)
}
