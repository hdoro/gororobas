import AnchorLink from '@/components/AnchorLink'
import { Button } from '@/components/ui/button'
import type { VegetablePageData } from '@/queries'
import { RichText } from '@/schemas'
import { cn } from '@/utils/cn'
import { paths } from '@/utils/urls'
import { Schema } from '@effect/schema'
import { Edit2Icon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import WishlistedBy from './WishlistedBy'

export default function VegetablePageSidebar({
	vegetable,
}: {
	vegetable: VegetablePageData
}) {
	const links = [
		{
			label: 'Visão geral',
			href: '#visao-geral',
			active: true,
		},
		vegetable.tips &&
			vegetable.tips.length > 0 && {
				label: 'Sugestões e dicas',
				href: '#sugestoes',
			},
		vegetable.varieties &&
			vegetable.varieties.length > 0 && {
				label: 'Variedades',
				href: '#variedades',
			},
		Schema.is(RichText)(vegetable.content) && {
			label: 'Curiosidades',
			href: '#curiosidades',
		},
		vegetable.friends &&
			vegetable.friends.length > 0 && {
				label: 'Amizades',
				href: '#amizades',
			},
		// @TODO: notas
	].flatMap((link) => link || [])

	return (
		<div className="flex-1">
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
