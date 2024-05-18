import { paths } from '@/utils/urls'
import Link from 'next/link'
import GororobasLogo from './icons/GororobasLogo'

const FOOTER_LINKS = [
	{ href: '/vegetais', text: 'Vegetais' },
	{ href: '/notas', text: 'Notas' },
	{ href: '/sobre', text: 'Sobre' },
]

export default function Footer() {
	return (
		<footer className="py-10 md:py-16 lg:py-24 bg-background-card px-pageX flex flex-col md:flex-row md:justify-start items-center md:items-start gap-[var(--page-padding-x)]">
			<Link href={paths.home()} rel="home" title="Página inicial">
				<GororobasLogo />
			</Link>
			<nav aria-label="Rodapé" className="flex items-center gap-10">
				{FOOTER_LINKS.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className="text-lg text-primary-800"
					>
						{link.text}
					</Link>
				))}
			</nav>
		</footer>
	)
}
