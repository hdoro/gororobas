import { auth } from '@/edgedb'
import { paths } from '@/utils/urls'
import Link from 'next/link'
import { Suspense } from 'react'
import UserNav from './UserNav'
import GororobasLogo from './icons/GororobasLogo'

const HEADER_LINKS = [
	{ href: '/vegetais', text: 'Vegetais' },
	{ href: '/sobre', text: 'Sobre' },
]

export default async function HeaderNav() {
	const session = auth.getSession()

	const signedIn = await session.isSignedIn()

	return (
		<nav
			aria-label="Navegação do cabeçalho"
			className="px-pageX pt-4 flex gap-3 justify-between items-center"
		>
			<Link href={paths.home()} rel="home" title="Página inicial">
				<GororobasLogo />
			</Link>

			<div className="flex items-center gap-10">
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
