import { SOURCE_CODE_URL } from '@/utils/config'
import { paths } from '@/utils/urls'
import {
  GithubIcon,
  LibraryBigIcon,
  NotebookPenIcon,
  SproutIcon,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import GororobasLogo from './icons/GororobasLogo'

const FOOTER_LINKS = [
  { href: paths.vegetablesIndex(), text: 'Vegetais', icon: SproutIcon },
  { href: paths.notesIndex(), text: 'Notas', icon: NotebookPenIcon },
  {
    href: paths.resourcesIndex(),
    text: 'Biblioteca Agroecológica',
    icon: LibraryBigIcon,
  },
] as const satisfies { href: string; text: string; icon: LucideIcon }[]

export default function Footer() {
  return (
    <footer
      className="border-t-primary-100 bg-background-card px-pageX flex flex-col items-center gap-[var(--page-padding-x)] border-t py-10 max-md:pb-28 md:flex-row md:items-start md:justify-start md:py-16 lg:py-24"
      aria-label="Rodapé"
      id="global-footer"
    >
      <Link href={paths.home()} rel="home" title="Página inicial">
        <GororobasLogo />
      </Link>
      <nav
        aria-label="Rodapé"
        className="flex flex-wrap items-center justify-center gap-10"
      >
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-primary-800 inline-flex items-center gap-2 text-lg"
          >
            <link.icon className="text-primary-700 size-[1.25em]" /> {link.text}
          </Link>
        ))}
        <a
          className="text-primary-800 inline-flex gap-2 text-lg"
          href={SOURCE_CODE_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          <GithubIcon className="text-primary-700 size-[1.25em]" />
          Código fonte
        </a>
      </nav>
    </footer>
  )
}
