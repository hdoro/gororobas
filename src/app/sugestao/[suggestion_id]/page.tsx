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
import { editSuggestionPreviewQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { EDIT_SUGGESTION_STATUS_TO_LABEL } from '@/utils/labels'
import { gender } from '@/utils/strings'
import { Effect, pipe } from 'effect'
import type { Changeset } from 'json-diff-ts'
import { AlertTriangleIcon } from 'lucide-react'
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

export default async function VegetableRoute({
	params,
}: {
	params: RouteParams
}) {
	const data = await getRouteData(params)

	if (!data || !data.target_object) return notFound()

	const diff = data.diff as Changeset
	return (
		<div className="px-pageX py-pageY">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle className="flex justify-between">
						{data.can_approve ? 'Avalie esta ' : 'Estamos avaliando sua '}{' '}
						sugestão para{' '}
						{gender.article(data.target_object.gender || 'NEUTRO')}{' '}
						{data.target_object.names[0] || 'vegetal'}
						<Badge variant={data.status === 'MERGED' ? 'default' : 'outline'}>
							Status: {EDIT_SUGGESTION_STATUS_TO_LABEL[data.status]}
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul>
						{diff.map((change) => (
							<li key={change.key}>
								{change.key}:{' '}
								{change.changes
									? `${change.changes.length} ${
											change.changes.length > 1 ? 'alterações' : 'alteração'
										}`
									: 'alterado'}
							</li>
						))}
					</ul>
					{data.can_approve && data.status === 'PENDING_REVIEW' && (
						<JudgeSuggestion suggestion_id={data.id} />
					)}
				</CardContent>
				<CardFooter className="flex items-start gap-3">
					<AlertTriangleIcon className="w-10 h-auto" />
					<Text level="h3">
						Ainda estamos trabalhando nessa parte do aplicativo
					</Text>
				</CardFooter>
			</Card>
		</div>
	)
}
