import { getEditSuggestionData } from '@/actions/getEditSuggestionData'
import {
	VegetablePageHero,
	type VegetablePageHeroData,
} from '@/app/vegetais/[handle]/VegetablePageHero'
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
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { auth } from '@/edgedb'
import type { EditSuggestionStatus } from '@/edgedb.interfaces'
import { type VegetableCardData, vegetableCardsByIdQuery } from '@/queries'
import { runServerEffect } from '@/services/runtime'
import {
	EDIT_SUGGESTION_STATUS_TO_LABEL,
	VEGETABLE_FIELD_LABELS_MAP,
} from '@/utils/labels'
import { gender } from '@/utils/strings'
import { paths } from '@/utils/urls'
import { Effect } from 'effect'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JudgeSuggestion from './JudgeSuggestion'

type RouteParams = {
	suggestion_id: string
}

async function getRouteData(params: RouteParams) {
	return runServerEffect(
		getEditSuggestionData(params.suggestion_id).pipe(
			Effect.catchAll(() => Effect.succeed(null)),
		),
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
		title: `Sugestão de edição d${gender.suffix(data.toRender.gender || 'NEUTRO')} ${data.toRender.names[0]} | Gororobas`,
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

	const { dataThatChanged, toRender, diff } = data
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
					vegetable={{ ...data.target_object, ...toRender }}
					diffKeys={
						diff.flatMap((d) => d.key) as (keyof VegetablePageHeroData)[]
					}
				/>
				{dataThatChanged.content && (
					<section className="my-36" id="curiosidades">
						<SectionTitle Icon={BulbIcon} includePadding={false}>
							Sobre {gender.article(toRender.gender || 'NEUTRO', 'both')}
							{toRender.names[0]}
						</SectionTitle>
						<div className="text-base box-content mt-5 space-y-3 relative pl-[2.625rem]">
							<ChangeIndicator />
							<DefaultTipTapRenderer content={toRender.content} />
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
							{(toRender.varieties || []).map((variety) => (
								// @ts-expect-error data is not perfectly the same, but it renders™
								<VegetableVarietyCard key={variety.handle} variety={variety} />
							))}
						</div>
					</section>
				)}
				{friends.length > 0 && (
					<section className="my-36" id="amizades">
						<SectionTitle Icon={VegetableFriendsIcon} includePadding={false}>
							Amigues d{gender.suffix(toRender.gender || 'NEUTRO')}{' '}
							{toRender.names[0]}
						</SectionTitle>
						<Text level="h3" className="font-normal pl-[2.625rem]">
							Plantas que gostam de serem plantadas e estarem próximas a
							{gender.suffix(toRender.gender || 'NEUTRO')} {toRender.names[0]}
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
					<div className="flex items-center gap-3">
						<Badge variant={STATUS_BADGE_MAP[data.status]}>
							Status:{' '}
							{EDIT_SUGGESTION_STATUS_TO_LABEL[data.status].toLowerCase()}
						</Badge>
						{data.created_at && (
							<Text level="sm" className="text-muted-foreground">
								{data.created_at.toLocaleDateString('pt-BR', {
									month: '2-digit',
									day: '2-digit',
									year: 'numeric',
								})}
							</Text>
						)}
					</div>
					<CardTitle>
						Sugestões para{' '}
						{gender.article(data.target_object.gender || 'NEUTRO')}{' '}
						<a
							href={paths.vegetable(data.target_object.handle)}
							className="link"
							// biome-ignore lint: same-site link
							target="_blank"
						>
							{data.target_object.names[0] || 'vegetal'}
						</a>
					</CardTitle>
					<div className="flex items-center gap-3">
						{data.created_by?.name && (
							<>
								<Text level="sm">Enviadas por:</Text>
								<ProfileCard profile={data.created_by} size="sm" />
							</>
						)}
					</div>
				</CardHeader>
				<CardContent className="border-t pt-4 md:pt-6">
					<ul className="space-y-3">
						{diff.map((change, i) => {
							// Only render the last change for each key
							if (diff.slice(i + 1).some((c) => c.key === change.key)) {
								return null
							}

							return (
								<li key={change.key}>
									<span className="font-medium">
										{VEGETABLE_FIELD_LABELS_MAP[
											change.key as keyof typeof VEGETABLE_FIELD_LABELS_MAP
										] || change.key}
										:{' '}
									</span>
									<span className="text-muted-foreground">
										{change.changes
											? `${change.changes.length} ${
													change.changes.length > 1 ? 'alterações' : 'alteração'
												}`
											: 'alterado'}
									</span>
								</li>
							)
						})}
					</ul>
				</CardContent>
				{data.can_approve && data.status === 'PENDING_REVIEW' && (
					<CardFooter className="border-t mt-2 grid grid-cols-2 gap-3">
						<JudgeSuggestion suggestion_id={data.id} />
					</CardFooter>
				)}
			</Card>
		</div>
	)
}
