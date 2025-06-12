'use client'

import Link from '@/components/LinkWithTransition'
import CameraIcon from '@/components/icons/CameraIcon'
import HistoryIcon from '@/components/icons/HistoryIcon'
import NoteIcon from '@/components/icons/NoteIcon'
import { m } from '@/paraglide/messages'
import { cn } from '@/utils/cn'
import { paths } from '@/utils/urls'
import { usePathname } from 'next/navigation'

export function ProfilePageNavigation(props: { handle: string }) {
  const pathname = usePathname()
  const links = [
    {
      label: m.careful_misty_blackbird_value(),
      href: paths.userProfile(props.handle),
      icon: NoteIcon,
    },
    {
      label: m.few_flat_wolf_dash(),
      href: paths.userGallery(props.handle),
      icon: CameraIcon,
    },
    {
      label: m.nice_tired_lionfish_sprout(),
      href: paths.userContributions(props.handle),
      icon: HistoryIcon,
    },
  ]

  return (
    <div className="hide-scrollbar px-pageX mt-10 flex overflow-x-auto overflow-y-visible border-b-2 border-stone-200">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'relative flex items-center gap-2 px-6 py-2 text-center font-medium',
              isActive && 'text-primary-700',
            )}
          >
            <link.icon
              variant={isActive ? 'color' : 'monochrome'}
              className="size-6"
            />
            {link.label}
            {isActive && (
              <div
                aria-hidden
                className="bg-primary-500 absolute inset-x-0 -bottom-0.5 h-1 rounded-full"
              />
            )}
          </Link>
        )
      })}
    </div>
  )
}
