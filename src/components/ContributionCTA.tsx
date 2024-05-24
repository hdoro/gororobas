import { paths } from '@/utils/urls'
import Link from 'next/link'
import NoteIcon from './icons/NoteIcon'
import SeedlingIcon from './icons/SeedlingIcon'
import SparklesIcon from './icons/SparklesIcon'
import { Button } from './ui/button'
import { Text } from './ui/text'

export function ContributionCTA() {
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
			<div className="flex items-center justify-center gap-3 mt-5">
				<Button asChild tone="secondary" mode="outline">
					<Link href={paths.newNote()}>
						<NoteIcon variant="monochrome" className="w-[1.25em]" /> Enviar sua
						nota
					</Link>
				</Button>
				<span className="text-muted-foreground">ou</span>
				<Button asChild>
					<Link href={paths.newVegetable()}>
						<SeedlingIcon variant="monochrome" className="w-[1.25em]" /> Enviar
						um novo vegetal
					</Link>
				</Button>
			</div>
		</section>
	)
}
