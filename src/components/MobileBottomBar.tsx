'use client'

import Link from '@/components/LinkWithTransition'
import { m } from '@/paraglide/messages'
import { cn } from '@/utils/cn'
import { paths, preparePath } from '@/utils/urls'
import { FilePlus2Icon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import type { JSX, SVGProps } from 'react'
import LibraryIcon from './icons/LibraryIcon'
import NoteIcon from './icons/NoteIcon'
import SeedlingIcon from './icons/SeedlingIcon'
import { Button } from './ui/button'

function LinkButton(props: {
  href: string
  Icon: (
    props: SVGProps<SVGSVGElement> & {
      variant: 'color' | 'monochrome'
    },
  ) => JSX.Element
  label: string
}) {
  const isActive = preparePath(usePathname()) === preparePath(props.href)

  return (
    <Button
      mode="bleed"
      tone="neutral"
      asChild
      size="xs"
      className={cn(
        'flex h-auto flex-col items-center justify-center gap-[0.25em] rounded-b-none border-y-4 px-4 py-1 text-xs',
        isActive && 'border-b-primary-400! text-primary-800',
        !isActive && 'border-transparent',
      )}
    >
      <Link href={props.href}>
        <props.Icon
          variant={isActive ? 'color' : 'monochrome'}
          className="mr-1 size-[1.75em] flex-[0_0_1.75em]"
        />{' '}
        <div>{props.label}</div>
      </Link>
    </Button>
  )
}

export default function MobileBottomBar({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname()

  if (
    pathname === paths.newNote() ||
    pathname === paths.newVegetable() ||
    pathname === paths.newResource()
  ) {
    return null
  }

  return (
    <div className="px-pageX fixed inset-x-0 bottom-0 z-30 flex w-screen items-stretch justify-center gap-2 bg-white lg:hidden">
      <LinkButton
        href={paths.notesIndex()}
        Icon={NoteIcon}
        label={m.swift_neat_bulldog_dazzle()}
      />
      <LinkButton
        href={paths.vegetablesIndex()}
        Icon={SeedlingIcon}
        label={m.alive_sunny_raven_dazzle()}
      />
      <LinkButton
        href={paths.resourcesIndex()}
        Icon={LibraryIcon}
        label={m.these_shy_millipede_evoke()}
      />
      {signedIn && pathname !== paths.newNote() && (
        <Link
          href={paths.newNote()}
          className="bg-primary-500 text-primary-50 flex size-12 flex-[0_0_3rem] -translate-y-3 items-center justify-center rounded-full border-4 border-white"
        >
          <FilePlus2Icon className="size-5" />{' '}
          <span className="sr-only">{m.witty_long_lynx_launch()}</span>
        </Link>
      )}
    </div>
  )
}
