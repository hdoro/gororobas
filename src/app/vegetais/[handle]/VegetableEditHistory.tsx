import ProfileCard from '@/components/ProfileCard'
import SectionTitle from '@/components/SectionTitle'
import HistoryIcon from '@/components/icons/HistoryIcon'
import { Text } from '@/components/ui/text'
import { client } from '@/edgedb'
import { editHistoryQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { paths } from '@/utils/urls'
import { Effect, pipe } from 'effect'
import { type Changeset, atomizeChangeset } from 'json-diff-ts'
import Link from 'next/link'

const fetchEditHistory = (vegetable_id: string) =>
	pipe(
		Effect.tryPromise({
			try: () =>
				editHistoryQuery.run(
					client.withConfig({
						// Edit suggestions aren't public - we only allow reading them from the vegetable page so we can render the user list
						apply_access_policies: false,
					}),
					{
						vegetable_id,
					},
				),
			catch: (error) => console.log(error),
		}),
		...buildTraceAndMetrics('edit_history', { vegetable_id }),
		Effect.catchAll(() => Effect.succeed(null)),
	)

export default async function VegetableEditHistory(props: {
	vegetable_id: string
}) {
	const data = await runServerEffect(fetchEditHistory(props.vegetable_id))

	if (!data || data.length === 0) {
		return null
	}

	return (
		<section className="my-36" id="contribuintes">
			<SectionTitle Icon={HistoryIcon}>Contribuições recentes</SectionTitle>
			<div className="flex flex-wrap gap-3 px-pageX mt-3">
				{data.map((d) => {
					const atomized = atomizeChangeset(d.diff as Changeset)
					return (
						<Link
							key={d.id}
							href={paths.editSuggestion(d.id)}
							className="block space-y-1 p-3 border bg-background-card rounded-md"
						>
							<Text level="sm" className="text-muted-foreground">
								{atomized.length} mudança{atomized.length > 1 ? 's' : ''}{' '}
								{d.created_at && (
									<>
										em{' '}
										{d.created_at.toLocaleDateString('pt-BR', {
											month: '2-digit',
											day: '2-digit',
											year: 'numeric',
										})}
									</>
								)}
							</Text>
							<div className="flex gap-1 items-center">
								{d.created_by ? (
									<>
										<ProfileCard profile={d.created_by} linkToProfile={false} />
									</>
								) : null}
							</div>
						</Link>
					)
				})}
			</div>
		</section>
	)
}
