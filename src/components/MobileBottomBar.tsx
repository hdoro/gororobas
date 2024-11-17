'use client'

import { cn } from '@/utils/cn'
import { formatPath, paths } from '@/utils/urls'
import { FilePlus2Icon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { SVGProps } from 'react'
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
  const isActive = formatPath(usePathname()) === formatPath(props.href)

  return (
    <Button
      mode="bleed"
      tone="neutral"
      size="lg"
      asChild
      className={cn(
        'flex h-auto w-40 flex-col items-center justify-center rounded-b-none border-b-4 py-2',
        isActive && '!border-b-primary-400 text-primary-800',
        !isActive && 'border-transparent',
      )}
    >
      <Link href={props.href}>
        <props.Icon
          variant={isActive ? 'color' : 'monochrome'}
          className="mr-1 size-6 flex-[0_0_1.5rem]"
        />{' '}
        <div>{props.label}</div>
      </Link>
    </Button>
  )
}

export default function MobileBottomBar({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname()

  if (pathname === paths.newNote() || pathname === paths.newVegetable()) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex w-screen items-stretch justify-center gap-2 bg-background px-pageX lg:hidden">
      <LinkButton href={paths.notesIndex()} Icon={NoteIcon} label="Notas" />
      {signedIn && pathname !== paths.newNote() && (
        <Link
          href={paths.newNote()}
          className="flex size-14 flex-[0_0_3.5rem] -translate-y-3 items-center justify-center rounded-full border-4 border-background bg-primary-500 text-primary-50"
        >
          <FilePlus2Icon className="size-7" />{' '}
          <span className="sr-only">Enviar nota</span>
        </Link>
      )}
      <LinkButton
        href={paths.vegetablesIndex()}
        Icon={SeedlingIcon}
        label="Vegetais"
      />
    </div>
  )
}
