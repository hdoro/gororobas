import { paths } from '@/utils/urls'
import Link from 'next/link'
import type { JSX } from 'react'
import NoteIcon from './icons/NoteIcon'
import SeedlingIcon from './icons/SeedlingIcon'
import SparklesIcon from './icons/SparklesIcon'
import { Button } from './ui/button'
import { Text } from './ui/text'

export function ContributionCTA({ customCTA }: { customCTA?: JSX.Element }) {
  return (
    <section className="px-pageX mx-auto my-36 box-content text-center md:max-w-lg">
      <SparklesIcon variant="color" className="mb-3 inline-block w-12" />
      <Text level="h2" as="h2">
        Gororobas é um espaço colaborativo
      </Text>
      <Text>
        Iríamos adorar receber suas notinhas ou conhecimento sobre plantas e
        agroecologia{' '}
      </Text>
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild tone="secondary" mode="outline">
          <Link href={paths.newNote()}>
            <NoteIcon variant="monochrome" className="w-[1.25em]" /> Envie sua
            nota
          </Link>
        </Button>
        <span className="text-muted-foreground">ou</span>
        {customCTA || (
          <Button asChild>
            <Link href={paths.newVegetable()}>
              <SeedlingIcon variant="monochrome" className="w-[1.25em]" /> Envie
              um novo vegetal
            </Link>
          </Button>
        )}
      </div>
    </section>
  )
}
