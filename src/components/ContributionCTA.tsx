import { NotebookPenIcon } from 'lucide-react'
import type { JSX } from 'react'
import Link from '@/components/LinkWithTransition'
import { m } from '@/paraglide/messages'
import { paths } from '@/utils/urls'
import NoteIcon from './icons/NoteIcon'
import SparklesIcon from './icons/SparklesIcon'
import { Button } from './ui/button'
import { Text } from './ui/text'

export function ContributionCTA({
  customCTA,
  title = m.warm_active_horse_persist(),
  subtitle = m.pink_neat_guppy_create(),
  newNoteLabel = m.proof_orange_gadfly_coax(),
  newResourceLabel = m.smart_slimy_hedgehog_radiate(),
}: {
  customCTA?: JSX.Element
  newNoteLabel?: string
  newResourceLabel?: string
  title?: string
  subtitle?: string
}) {
  return (
    <section className="px-pageX mx-auto my-36 box-content text-center md:max-w-lg">
      <SparklesIcon variant="color" className="mb-3 inline-block w-12" />
      <Text level="h2" as="h2">
        {title}
      </Text>
      <Text>{subtitle}</Text>
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild tone="secondary" mode="outline">
          <Link href={paths.newNote()}>
            <NoteIcon variant="monochrome" className="w-[1.25em]" />{' '}
            {newNoteLabel}
          </Link>
        </Button>
        <span className="text-muted-foreground">ou</span>
        {customCTA || (
          <Button asChild>
            <Link href={paths.newResource()}>
              <NotebookPenIcon className="w-[1.25em]" /> {newResourceLabel}
            </Link>
          </Button>
        )}
      </div>
    </section>
  )
}
