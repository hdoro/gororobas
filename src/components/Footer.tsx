import { SOURCE_CODE_URL } from '@/utils/config'
import { paths } from '@/utils/urls'
import { GithubIcon } from 'lucide-react'
import Link from 'next/link'
import GororobasLogo from './icons/GororobasLogo'

const FOOTER_LINKS = [
	{ href: paths.vegetablesIndex(), text: 'Vegetais' },
	{ href: paths.notesIndex(), text: 'Notas' },
]

export default function Footer() {
	return (
		<footer
			className="py-10 md:py-16 lg:py-24 bg-background-card px-pageX flex flex-col md:flex-row md:justify-start items-center md:items-start gap-[var(--page-padding-x)] border-t border-t-primary-100"
			aria-label="Rodapé"
		>
			<Link href={paths.home()} rel="home" title="Página inicial">
				<GororobasLogo />
			</Link>
			<nav
				aria-label="Rodapé"
				className="flex flex-wrap justify-center items-center gap-10"
			>
				{FOOTER_LINKS.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className="text-lg text-primary-800"
					>
						{link.text}
					</Link>
				))}
				<a
					className="text-lg text-primary-800 inline-flex gap-2"
					href={SOURCE_CODE_URL}
					rel="noopener noreferrer"
					target="_blank"
				>
					<GithubIcon />
					Código fonte
				</a>
			</nav>
		</footer>
	)
}
