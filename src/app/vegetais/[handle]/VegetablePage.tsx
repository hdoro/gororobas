import { ContributionCTA } from '@/components/ContributionCTA'
import NotesGrid from '@/components/NotesGrid'
import { SanityImage } from '@/components/SanityImage'
import SectionTitle from '@/components/SectionTitle'
import { SendTipDialog } from '@/components/SendTipDialog'
import SourcesGrid from '@/components/SourcesGrid'
import VegetablesGrid from '@/components/VegetablesGrid'
import BulbIcon from '@/components/icons/BulbIcon'
import NoteIcon from '@/components/icons/NoteIcon'
import QuoteIcon from '@/components/icons/QuoteIcon'
import RainbowIcon from '@/components/icons/RainbowIcon'
import ShovelIcon from '@/components/icons/ShovelIcon'
import SparklesIcon from '@/components/icons/SparklesIcon'
import VegetableFriendsIcon from '@/components/icons/VegetableFriendsIcon'
import TipTapRenderer from '@/components/tiptap/DefaultTipTapRenderer'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import type { VegetablePageData } from '@/queries'
import { RichText } from '@/schemas'
import { gender } from '@/utils/strings'
import { paths } from '@/utils/urls'
import * as S from '@effect/schema/Schema'
import Link from 'next/link'
import { VegetablePageHero } from './VegetablePageHero'
import VegetablePageSidebar from './VegetablePageSidebar'
import VegetableTips from './VegetableTips'

export default function VegetablePage({
	vegetable,
}: {
	vegetable: VegetablePageData
}) {
	const { names = [] } = vegetable

	const friends = vegetable.friends || []

	const allSources = [
		...(vegetable.tips || []).flatMap((tip) => tip?.sources || []),
		...(vegetable.photos || []).flatMap((photo) => photo?.sources || []),
		...(vegetable.varieties || []).flatMap(
			(variety) =>
				variety?.photos?.flatMap((photo) => photo?.sources || []) || [],
		),
		...(vegetable.sources || []),
	]
	const externalSources = allSources.flatMap((source, index) => {
		if (source?.type !== 'EXTERNAL') return []

		return allSources
			.slice(index + 1)
			.some(
				(s) =>
					s.credits === source.credits ||
					(source.origin && s.origin === source.origin),
			)
			? []
			: source
	})
	const internalSources = allSources.flatMap((source, index) => {
		if (source?.type !== 'GOROROBAS') return []

		return {
			...source,
			// de-duplicate users that show up in multiple sources
			users: source.users.filter(
				(user) =>
					!allSources
						.slice(index + 1)
						.some(
							(s) =>
								s.type === 'GOROROBAS' &&
								s.users.some((u) => u.handle === user.handle),
						),
			),
		}
	})

	return (
		<main className="py-12">
			<div
				className="flex flex-col lg:flex-row lg:items-start gap-[4.5rem] px-pageX relative"
				id="visao-geral"
			>
				<VegetablePageHero vegetable={vegetable} />
				<VegetablePageSidebar
					vegetable={vegetable}
					hasExternalSources={externalSources.length > 0}
					hasInternalSources={internalSources.length > 0}
				/>
			</div>
			<section className="my-36" id="sugestoes">
				<SectionTitle
					Icon={ShovelIcon}
					CTA={
						vegetable.tips.length > 0 ? (
							<SendTipDialog vegetable={vegetable} />
						) : null
					}
				>
					Sugestões e dicas
				</SectionTitle>
				{vegetable.tips.length > 0 ? (
					<VegetableTips tips={vegetable.tips} />
				) : (
					<div className="space-y-2 px-pageX mt-1">
						<Text level="p">
							Ainda não temos dicas sobre esse vegetal. Que tal enviar a sua?
						</Text>
						<SendTipDialog vegetable={vegetable} />
					</div>
				)}
			</section>
			{Array.isArray(vegetable.varieties) && vegetable.varieties.length > 0 && (
				<section className="my-36" id="variedades">
					<SectionTitle Icon={RainbowIcon}>Variedades</SectionTitle>
					<div className="overflow-x-auto flex gap-20 mt-3 px-pageX hide-scrollbar">
						{vegetable.varieties.map((variety) => {
							if (!variety.names || variety.names.length === 0) return null

							return (
								<div key={variety.handle} className="flex gap-5 items-center">
									{Array.isArray(variety.photos) &&
										variety.photos[0]?.sanity_id && (
											<SanityImage
												image={variety.photos[0]}
												maxWidth={200}
												className="w-auto flex-0 max-h-[12.5rem] max-w-[12.5rem] object-cover rounded-lg"
											/>
										)}
									<div
										style={{
											minWidth: `${variety.names[0].length / 2}ch`,
										}}
									>
										<Text level="h3" weight="normal">
											{variety.names[0]}
										</Text>
										{variety.names.length > 1 && (
											<Text level="p">{variety.names.slice(1).join(', ')}</Text>
										)}
									</div>
								</div>
							)
						})}
					</div>
				</section>
			)}
			{S.is(RichText)(vegetable.content) && (
				<section className="my-36" id="curiosidades">
					<SectionTitle Icon={BulbIcon}>
						Sobre {gender.article(vegetable.gender || 'NEUTRO', 'both')}
						{names[0]}
					</SectionTitle>
					<div className="px-pageX text-base max-w-[39.375rem] box-content mt-5 space-y-3">
						<TipTapRenderer content={vegetable.content} />
					</div>
				</section>
			)}
			{friends.length > 0 && (
				<section className="my-36" id="amizades">
					<SectionTitle Icon={VegetableFriendsIcon}>
						Amigues d{gender.suffix(vegetable.gender || 'NEUTRO')} {names[0]}
					</SectionTitle>
					<Text level="h3" className="px-pageX font-normal">
						Plantas que gostam de serem plantadas e estarem próximas a
						{gender.suffix(vegetable.gender || 'NEUTRO')} {names[0]}
					</Text>
					<VegetablesGrid vegetables={friends} className="mt-6 px-pageX" />
				</section>
			)}
			{externalSources.length > 0 && (
				<section className="my-36" id="fontes">
					<SectionTitle Icon={QuoteIcon}>Fontes e recursos</SectionTitle>
					<Text level="h3" className="px-pageX font-normal">
						Materiais que embasaram essas informações e/ou fontes de algumas das
						fotos mostradas aqui
					</Text>
					<SourcesGrid sources={externalSources} className="px-pageX mt-10" />
				</section>
			)}
			{internalSources.length > 0 && (
				<section className="my-36" id="contribuintes">
					<SectionTitle Icon={SparklesIcon}>
						Pessoas que contribuiram
					</SectionTitle>
					<Text level="h3" className="px-pageX font-normal">
						Quem aqui no Gororobas contribuiu com fotos e/ou dicas
					</Text>
					<SourcesGrid sources={internalSources} className="px-pageX mt-10" />
				</section>
			)}
			<section className="my-36" id="notas">
				<SectionTitle
					Icon={NoteIcon}
					CTA={
						vegetable.related_notes.length > 0 ? (
							<Button asChild>
								<Link href={paths.newNote()}>Enviar sua nota</Link>
							</Button>
						) : null
					}
				>
					Aprendizados e experimentos
				</SectionTitle>
				{vegetable.related_notes.length > 0 ? (
					<NotesGrid notes={vegetable.related_notes} />
				) : (
					<Text level="p" className="px-pageX mt-1">
						Ainda não temos notas sobre esse vegetal. Que tal{' '}
						<Link href={paths.newNote()} className="link">
							enviar uma
						</Link>
						?
					</Text>
				)}
			</section>
			<ContributionCTA />
		</main>
	)
}
