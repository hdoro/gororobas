import { paths } from '@/utils/urls'
import Link from 'next/link'
import { Suspense } from 'react'
import UserNav from './UserNav'
import GororobasLogo from './icons/GororobasLogo'

const HEADER_LINKS = [
  { href: paths.vegetablesIndex(), text: 'Vegetais' },
  { href: paths.notesIndex(), text: 'Notas' },
]

export default async function HeaderNav({ signedIn }: { signedIn: boolean }) {
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
              className="text-primary-800 hidden text-lg md:block"
            >
              {link.text}
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
