import { auth } from '@/edgedb'
import { paths } from '@/utils/urls'
import Link from 'next/link'
import { Suspense } from 'react'
import UserNav from './UserNav'
import GororobasLogo from './icons/GororobasLogo'

const HEADER_LINKS = [
	{ href: paths.vegetablesIndex(), text: 'Vegetais' },
	{ href: paths.notesIndex(), text: 'Notas' },
]

export default async function HeaderNav() {
	const session = auth.getSession()

	const signedIn = await session.isSignedIn()

	return (
		<nav
			aria-label="Navegação do cabeçalho"
			className="w-full px-pageX pt-4 flex flex-wrap gap-3 justify-between items-center"
		>
			<Link href={paths.home()} rel="home" title="Página inicial">
				<GororobasLogo />
			</Link>

			<div className="flex flex-wrap items-center gap-x-10 gap-y-3">
				{HEADER_LINKS.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className="text-lg text-primary-800"
					>
						{link.text}
					</Link>
				))}
				<Suspense fallback={signedIn ? <div className="w-7" /> : null}>
					<UserNav signedIn={signedIn} />
				</Suspense>
			</div>
		</nav>
	)
}
