import { type Locale, getUserLocale } from '@/utils/i18n'
import { paths } from '@/utils/urls'
import {
  LibraryBigIcon,
  type LucideIcon,
  NotebookPenIcon,
  SproutIcon,
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import UserNav from './UserNav'
import GororobasLogo from './icons/GororobasLogo'

const HEADER_LINKS = [
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
    text: { pt: 'Biblioteca', es: 'Biblioteca' },
    icon: LibraryBigIcon,
  },
] as const satisfies {
  href: string
  text: Record<Locale, string>
  icon: LucideIcon
}[]

export default async function HeaderNav({ signedIn }: { signedIn: boolean }) {
  const locale = await getUserLocale()
  return (
    <>
      <nav
        aria-label="Navegação do cabeçalho"
        className="px-pageX flex w-full flex-wrap items-center justify-between gap-3 pt-4"
      >
        <Link href={paths.home()} rel="home" title="Página inicial">
          <GororobasLogo className="h-[1em] md:h-[1.5em]" />
        </Link>

        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          {HEADER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-primary-800 hidden items-center gap-1 text-lg md:flex"
            >
              <link.icon className="text-primary-600 size-[1.25em]" />{' '}
              {link.text[locale]}
            </Link>
          ))}
          <Suspense fallback={signedIn ? <div className="w-7" /> : null}>
            <UserNav signedIn={signedIn} />
          </Suspense>
        </div>
      </nav>
    </>
  )
}
