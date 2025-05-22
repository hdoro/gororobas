import Link from '@/components/LinkWithTransition'
import { m } from '@/paraglide/messages'
import { SOURCE_CODE_URL } from '@/utils/config'
import { paths } from '@/utils/urls'
import {
  GithubIcon,
  LibraryBigIcon,
  type LucideIcon,
  NotebookPenIcon,
  SproutIcon,
} from 'lucide-react'
import GororobasLogo from './icons/GororobasLogo'

const FOOTER_LINKS = [
  {
    href: paths.vegetablesIndex(),
    get text() {
      return m.tired_level_snail_roar()
    },
    icon: SproutIcon,
  },
  {
    href: paths.notesIndex(),
    get text() {
      return m.least_polite_elephant_burn()
    },
    icon: NotebookPenIcon,
  },
  {
    href: paths.resourcesIndex(),
    get text() {
      return m.noble_good_tortoise_rush()
    },
    icon: LibraryBigIcon,
  },
  {
    href: SOURCE_CODE_URL,
    get text() {
      return m.quaint_nimble_racoon_talk()
    },
    icon: GithubIcon,
  },
] as const satisfies {
  href: string
  text: string
  icon: LucideIcon
}[]

export default async function Footer() {
  return (
    <footer
      className="border-t-primary-100 bg-background-card px-pageX flex flex-col items-center gap-[var(--page-padding-x)] border-t py-10 max-md:pb-28 md:flex-row md:items-start md:justify-start md:py-16 lg:py-24"
      aria-label={m.tired_every_warbler_lock()}
      id="global-footer"
    >
      <Link
        href={paths.home()}
        rel="home"
        title={m.broad_deft_cockroach_spin()}
      >
        <GororobasLogo />
      </Link>
      <nav
        aria-label={m.alive_drab_squirrel_explore()}
        id="global-footer-nav"
        className="flex flex-wrap items-center justify-center gap-10"
      >
        {FOOTER_LINKS.map((link) => {
          const className =
            'text-primary-800 inline-flex items-center gap-2 text-lg'
          const Content = (
            <>
              <link.icon className="text-primary-700 size-[1.25em]" />{' '}
              {link.text}
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
