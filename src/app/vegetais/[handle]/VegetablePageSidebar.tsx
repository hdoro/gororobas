import AnchorLink from '@/components/AnchorLink'
import { Button } from '@/components/ui/button'
import type { VegetablePageData } from '@/queries'
import { cn } from '@/utils/cn'
import { isRenderableRichText } from '@/utils/tiptap'
import { paths } from '@/utils/urls'
import { Edit2Icon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import WishlistedBy from './WishlistedBy'

export default function VegetablePageSidebar({
	vegetable,
	hasExternalSources,
}: {
	vegetable: VegetablePageData
	hasExternalSources: boolean
}) {
	const links = [
		{
			label: 'Visão geral',
			href: '#visao-geral',
			active: true,
		},
		{
			label: 'Sugestões e dicas',
			href: '#sugestoes',
		},
		vegetable.varieties &&
			vegetable.varieties.length > 0 && {
				label: 'Variedades',
				href: '#variedades',
			},
		isRenderableRichText(vegetable.content) && {
			label: 'Curiosidades',
			href: '#curiosidades',
		},
		vegetable.friends &&
			vegetable.friends.length > 0 && {
				label: 'Amizades e consórcios',
				href: '#amizades',
			},
		hasExternalSources && {
			label: 'Fontes e recursos',
			href: '#fontes',
		},
		{
			label: 'Quem contribuiu',
			href: '#contribuintes',
		},
		{
			label: 'Aprendizados e experimentos',
			href: '#notas',
		},
	].flatMap((link) => link || [])

	return (
		<div className="flex-1 lg:sticky lg:top-2">
			<nav aria-label="Tabela de conteúdo">
				{links.map((link, index) => (
					<AnchorLink
						key={link.href}
						href={link.href}
						className={cn(
							'relative block text-primary-900 text-sm pl-2 py-2 border-l-2 border-l-primary-100 hover:border-l-primary-500',
							link.active && 'font-medium',
						)}
					>
						{index === 0 && (
							<div
								aria-hidden
								className="absolute right-full w-0.5 h-1/2 top-0 bg-background"
							/>
						)}
						{index === links.length - 1 && link.active && (
							<div
								aria-hidden
								className="absolute right-full w-0.5 h-1/2 bottom-0 bg-background"
							/>
						)}
						{link.active && (
							<div
								aria-hidden
								className="absolute left-0 -translate-x-[calc(50%_+_1px)] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full"
							/>
						)}
						{link.label}
					</AnchorLink>
				))}
				<Button tone="secondary" mode="outline" asChild className="mt-4">
					<Link href={paths.editVegetable(vegetable.handle)}>
						<Edit2Icon className="w-[1.25em]" />
						Sugerir edição
					</Link>
				</Button>
			</nav>
			<Suspense>
				<WishlistedBy vegetable_id={vegetable.id} />
			</Suspense>
		</div>
	)
}
