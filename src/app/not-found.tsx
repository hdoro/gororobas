import ReplaceI18nFragments from '@/components/ReplaceI18nFragments'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { m } from '@/paraglide/messages'
import { configureServerLocale } from '@/utils/i18n.server'
import { paths } from '@/utils/urls'
import type { Metadata } from 'next'
import Image from 'next/image'
import bgImage from '../404-bg.png'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: m.round_tense_cow_clasp(),
    robots: 'noindex nofollow',
  }
}

export default async function NotFoundRoute() {
  await configureServerLocale()
  return (
    <main className="px-pageX relative mt-4 flex min-h-full items-center justify-center overflow-hidden">
      <div className="z-10 max-w-md space-y-2 text-center">
        <Text level="h1" as="h1">
          <ReplaceI18nFragments message={m.dull_long_mantis_flow()} />
        </Text>
        <Button asChild>
          <a href={paths.home()}>{m.real_elegant_bison_drip()}</a>
        </Button>
      </div>
      <Image
        alt={m.tasty_bland_grebe_endure()}
        src={bgImage}
        fill
        className="absolute inset-0 block object-cover"
      />
    </main>
  )
}
