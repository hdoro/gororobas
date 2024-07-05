import { paths } from '@/utils/urls'
import Link from 'next/link'
import NoteIcon from './icons/NoteIcon'
import SeedlingIcon from './icons/SeedlingIcon'
import SparklesIcon from './icons/SparklesIcon'
import { Button } from './ui/button'
import { Text } from './ui/text'

export function ContributionCTA({ customCTA }: { customCTA?: JSX.Element }) {
	return (
		<section className="my-36 px-pageX text-center md:max-w-lg mx-auto box-content">
			<SparklesIcon variant="color" className="w-12 inline-block mb-3" />
			<Text level="h2" as="h2">
				Gororobas é um espaço colaborativo
			</Text>
			<Text>
				Iríamos adorar receber suas notinhas ou conhecimento sobre plantas e
				agroecologia{' '}
			</Text>
			<div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5">
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
