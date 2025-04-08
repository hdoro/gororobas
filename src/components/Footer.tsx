import { getLocale } from '@/paraglide/runtime'
import { SOURCE_CODE_URL } from '@/utils/config'
import type { Locale } from '@/utils/i18n'
import { paths } from '@/utils/urls'
import {
  GithubIcon,
  LibraryBigIcon,
  type LucideIcon,
  NotebookPenIcon,
  SproutIcon,
} from 'lucide-react'
import Link from 'next/link'
import GororobasLogo from './icons/GororobasLogo'

const FOOTER_LINKS = [
  {
    href: paths.vegetablesIndex(),
    text: { pt: 'Vegetais', es: 'Vegetales' },
    icon: SproutIcon,
  },
  {
    href: paths.notesIndex(),
    text: { pt: 'Notas', es: 'Notas' },
    icon: NotebookPenIcon,
  },
  {
    href: paths.resourcesIndex(),
    text: { pt: 'Biblioteca Agroecológica', es: 'Biblioteca Agroecológica' },
    icon: LibraryBigIcon,
  },
  {
    href: SOURCE_CODE_URL,
    text: { pt: 'Código fonte', es: 'Código fuente' },
    icon: GithubIcon,
  },
] as const satisfies {
  href: string
  text: Record<Locale, string>
  icon: LucideIcon
}[]

export default async function Footer() {
  const locale = getLocale()
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
        {FOOTER_LINKS.map((link) => {
          const className =
            'text-primary-800 inline-flex items-center gap-2 text-lg'
          const Content = (
            <>
              <link.icon className="text-primary-700 size-[1.25em]" />{' '}
              {link.text[locale]}
            </>
          )

          if (link.href.startsWith('http')) {
            return (
              <a
                key={link.href}
                href={link.href}
                className={className}
                rel="noopener noreferrer"
                target="_blank"
              >
                {Content}
              </a>
            )
          }

          return (
            <Link key={link.href} href={link.href} className={className}>
              {Content}
            </Link>
          )
        })}
      </nav>
    </footer>
  )
}
