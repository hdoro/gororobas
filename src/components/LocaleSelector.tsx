'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { m } from '@/paraglide/messages'
import { getLocale } from '@/paraglide/runtime'
import { LOCALE_LABELS } from '@/utils/i18n'
import { CheckIcon, LanguagesIcon } from 'lucide-react'
import { Button } from './ui/button'

export default function LocaleSelector({
  placement,
}: {
  placement: 'header' | 'footer'
}) {
  const locale = getLocale()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          mode={placement === 'header' ? 'bleed' : 'outline'}
          size={placement === 'header' ? 'sm' : 'lg'}
        >
          <LanguagesIcon className="size-[1.25em]" />
          <span className={placement === 'header' ? 'sr-only' : ''}>
            {LOCALE_LABELS[getLocale()]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{m.major_simple_ibex_swim()}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {Object.entries(LOCALE_LABELS).map(([availableLocale, localeLabel]) => (
          <DropdownMenuItem key={availableLocale} asChild>
            <a href={`/api/select-locale?locale=${availableLocale}`}>
              {availableLocale === locale ? (
                <CheckIcon className="text-primary-700 mr-1 size-[1em]" />
              ) : (
                <div className="mr-1 size-[1em]" />
              )}
              {localeLabel}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
