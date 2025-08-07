import {
  LibraryBigIcon,
  type LucideIcon,
  NotebookPenIcon,
  SproutIcon,
} from 'lucide-react'
import { Suspense } from 'react'
import Link from '@/components/LinkWithTransition'
import { m } from '@/paraglide/messages'
import { paths } from '@/utils/urls'
import GororobasLogo from './icons/GororobasLogo'
import LocaleSelector from './LocaleSelector'
import UserNav from './UserNav'

const HEADER_LINKS = () =>
  [
    {
      href: paths.vegetablesIndex(),
      text: m.known_patient_iguana_race(),
      icon: SproutIcon,
    },
    {
      href: paths.notesIndex(),
      text: m.cool_arable_jackal_jest(),
      icon: NotebookPenIcon,
    },
    {
      href: paths.resourcesIndex(),
      text: m.glad_agent_canary_peek(),
      icon: LibraryBigIcon,
    },
  ] as const satisfies {
    href: string
    text: string
    icon: LucideIcon
  }[]

export default async function HeaderNav({ signedIn }: { signedIn: boolean }) {
  return (
    <nav
      aria-label={m.fine_factual_hound_compose()}
      className="px-pageX flex w-full flex-wrap items-center justify-between gap-3 pt-4"
    >
      <Link href={paths.home()} rel="home" title="Página inicial">
        <GororobasLogo className="h-[1em] md:h-[1.5em]" />
      </Link>

      <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
        {HEADER_LINKS().map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-primary-800 hidden items-center gap-1 text-lg md:flex"
          >
            <link.icon className="text-primary-600 size-[1.25em]" /> {link.text}
          </Link>
        ))}
        <div className="flex items-center gap-x-3">
          <LocaleSelector placement="header" />
          <Suspense fallback={signedIn ? <div className="w-7" /> : null}>
            <UserNav signedIn={signedIn} />
          </Suspense>
        </div>
      </div>
    </nav>
  )
}
