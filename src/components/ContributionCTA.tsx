import Link from '@/components/LinkWithTransition'
import { paths } from '@/utils/urls'
import type { JSX } from 'react'
import NoteIcon from './icons/NoteIcon'
import SeedlingIcon from './icons/SeedlingIcon'
import SparklesIcon from './icons/SparklesIcon'
import { Button } from './ui/button'
import { Text } from './ui/text'

export function ContributionCTA({
  customCTA,
  title = 'Gororobas é um espaço colaborativo',
  subtitle = 'Iríamos adorar receber suas notinhas ou conhecimento sobre plantas e agroecologia',
  newNoteLabel = 'Envie sua nota',
  newVegetableLabel = 'Envie um novo vegetal',
}: {
  customCTA?: JSX.Element
  newNoteLabel?: string
  newVegetableLabel?: string
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
            <Link href={paths.newVegetable()}>
              <SeedlingIcon variant="monochrome" className="w-[1.25em]" />{' '}
              {newVegetableLabel}
            </Link>
          </Button>
        )}
      </div>
    </section>
  )
}
