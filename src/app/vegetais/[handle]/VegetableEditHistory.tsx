import SectionTitle from '@/components/SectionTitle'
import SuggestionCard from '@/components/SuggestionCard'
import HistoryIcon from '@/components/icons/HistoryIcon'
import { client } from '@/edgedb'
import { editHistoryQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'

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
	const acceptedSuggestions = await runServerEffect(
		fetchEditHistory(props.vegetable_id),
	)

	if (!acceptedSuggestions || acceptedSuggestions.length === 0) {
		return null
	}

	return (
		<section className="my-36" id="contribuintes">
			<SectionTitle Icon={HistoryIcon}>Contribuições recentes</SectionTitle>
			<div className="flex flex-wrap gap-3 px-pageX mt-3">
				{acceptedSuggestions.map((suggestion) => (
					<SuggestionCard key={suggestion.id} suggestion={suggestion} />
				))}
			</div>
		</section>
	)
}
