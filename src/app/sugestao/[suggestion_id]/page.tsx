import {
	VegetablePageHero,
	type VegetablePageHeroData,
} from '@/app/vegetais/[handle]/VegetablePageHero'
import { vegetableEditingToForDBWithImages } from '@/app/vegetais/[handle]/editar/page'
import ChangeIndicator from '@/components/ChangeIndicator'
import ProfileCard from '@/components/ProfileCard'
import SectionTitle from '@/components/SectionTitle'
import VegetableVarietyCard from '@/components/VegetableVarietyCard'
import VegetablesGrid from '@/components/VegetablesGrid'
import BulbIcon from '@/components/icons/BulbIcon'
import RainbowIcon from '@/components/icons/RainbowIcon'
import VegetableFriendsIcon from '@/components/icons/VegetableFriendsIcon'
import DefaultTipTapRenderer from '@/components/tiptap/DefaultTipTapRenderer'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { auth } from '@/edgedb'
import type { EditSuggestionStatus } from '@/edgedb.interfaces'
import {
	type VegetableCardData,
	editSuggestionPreviewQuery,
	vegetableCardsByIdQuery,
} from '@/queries'
import type { VegetableForDBWithImages } from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { getChangedObjectSubset } from '@/utils/diffs'
import {
	EDIT_SUGGESTION_STATUS_TO_LABEL,
	VEGETABLE_FIELD_LABELS_MAP,
} from '@/utils/labels'
import { gender } from '@/utils/strings'
import { Effect, pipe } from 'effect'
import type { Changeset } from 'json-diff-ts'
import { applyChangeset } from 'json-diff-ts'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JudgeSuggestion from './JudgeSuggestion'

type RouteParams = {
	suggestion_id: string
}

function getRouteData({ suggestion_id }: RouteParams) {
	const session = auth.getSession()

	return runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () =>
					editSuggestionPreviewQuery.run(session.client, {
						suggestion_id,
					}),
				catch: (error) => console.log(error),
			}),
			...buildTraceAndMetrics('suggestion_page', {
				suggestion_id,
			}),
		).pipe(Effect.catchAll(() => Effect.succeed(null))),
	)
}

export async function generateMetadata({
	params,
}: {
	params: RouteParams
}): Promise<Metadata> {
	const data = await getRouteData(params)
	if (!data?.target_object?.names) return {}

	return {
		title: `Prévia de edição de ${data.target_object.names[0]} | Gororobas`,
		robots: {
			index: false,
			follow: false,
		},
	}
}

const STATUS_BADGE_MAP: Record<
	EditSuggestionStatus,
	'default' | 'outline' | 'note'
> = {
	PENDING_REVIEW: 'outline',
	MERGED: 'default',
	REJECTED: 'note',
}

export default async function EditSuggestionRoute({
	params,
}: {
	params: RouteParams
}) {
	const data = await getRouteData(params)

	if (!data || !data.target_object) return notFound()

	const diff = data.diff as Changeset

	const currentVegetable = vegetableEditingToForDBWithImages(data.target_object)
	const updatedVegetable = applyChangeset(
		structuredClone(currentVegetable),
		diff,
	) as VegetableForDBWithImages
	const dataThatChanged = getChangedObjectSubset({
		prev: currentVegetable,
		next: updatedVegetable,
	})

	const friends = dataThatChanged.friends
		? await vegetableCardsByIdQuery.run(auth.getSession().client, {
				vegetable_ids: dataThatChanged.friends,
			})
		: ([] as VegetableCardData[])

	return (
		<div className="px-pageX py-pageY flex flex-col lg:flex-row items-start gap-6">
			<div className="flex-1 lg:sticky top-2">
				<VegetablePageHero
					// @ts-expect-error data is not perfectly the same, but it renders™
					vegetable={{ ...data.target_object, ...updatedVegetable }}
					dataThatChanged={
						Object.keys(dataThatChanged) as (keyof VegetablePageHeroData)[]
					}
				/>
				{dataThatChanged.content && (
					<section className="my-36" id="curiosidades">
						<SectionTitle Icon={BulbIcon} includePadding={false}>
							Sobre{' '}
							{gender.article(updatedVegetable.gender || 'NEUTRO', 'both')}
							{updatedVegetable.names[0]}
						</SectionTitle>
						<div className="text-base box-content mt-5 space-y-3 relative pl-[2.625rem]">
							<ChangeIndicator />
							<DefaultTipTapRenderer content={dataThatChanged.content} />
						</div>
					</section>
				)}
				{dataThatChanged.varieties && (
					<section className="my-36" id="variedades">
						<SectionTitle Icon={RainbowIcon} includePadding={false}>
							Variedades
						</SectionTitle>

						<div className="flex flex-wrap gap-20 mt-3 pl-[2.625rem] relative">
							<ChangeIndicator />
							{dataThatChanged.varieties.map((variety) => (
								// @ts-expect-error data is not perfectly the same, but it renders™
								<VegetableVarietyCard key={variety.handle} variety={variety} />
							))}
						</div>
					</section>
				)}
				{friends.length > 0 && (
					<section className="my-36" id="amizades">
						<SectionTitle Icon={VegetableFriendsIcon} includePadding={false}>
							Amigues d{gender.suffix(updatedVegetable.gender || 'NEUTRO')}{' '}
							{updatedVegetable.names[0]}
						</SectionTitle>
						<Text level="h3" className="font-normal pl-[2.625rem]">
							Plantas que gostam de serem plantadas e estarem próximas a
							{gender.suffix(updatedVegetable.gender || 'NEUTRO')}{' '}
							{updatedVegetable.names[0]}
						</Text>
						<div className="relative pl-[2.625rem]">
							<ChangeIndicator />
							<VegetablesGrid vegetables={friends} className="mt-6" />
						</div>
					</section>
				)}
			</div>
			<Card className="flex-1 max-w-md lg:sticky top-2">
				<CardHeader className="space-y-3">
					<div className="flex justify-between items-end">
						<Badge variant={STATUS_BADGE_MAP[data.status]}>
							Status: {EDIT_SUGGESTION_STATUS_TO_LABEL[data.status]}
						</Badge>
						{data.can_approve && data.status === 'PENDING_REVIEW' && (
							<JudgeSuggestion suggestion_id={data.id} />
						)}
					</div>
					<CardTitle className="flex justify-between">
						Sugestão para{' '}
						{gender.article(data.target_object.gender || 'NEUTRO')}{' '}
						{data.target_object.names[0] || 'vegetal'}
					</CardTitle>
					{data.created_by && (
						<div className="flex items-center gap-3">
							<Text level="sm">Sugestões por:</Text>
							<ProfileCard profile={data.created_by} size="sm" />
						</div>
					)}
				</CardHeader>
				<CardContent className="border-t pt-4 md:pt-6">
					<ul>
						{diff.map((change) => {
							return (
								<li key={change.key}>
									{VEGETABLE_FIELD_LABELS_MAP[
										change.key as keyof typeof VEGETABLE_FIELD_LABELS_MAP
									] || change.key}
									:{' '}
									{change.changes
										? `${change.changes.length} ${
												change.changes.length > 1 ? 'alterações' : 'alteração'
											}`
										: 'alterado'}
								</li>
							)
						})}
					</ul>
				</CardContent>
			</Card>
		</div>
	)
}
