import { vegetableEditingToForDBWithImages } from '@/app/vegetais/[handle]/editar/page'
import { auth } from '@/edgedb'
import { editSuggestionPreviewQuery } from '@/queries'
import type { VegetableForDBWithImages } from '@/schemas'
import { buildTraceAndMetrics } from '@/services/runtime'
import { NotFoundError } from '@/types/errors'
import { getChangedObjectSubset } from '@/utils/diffs'
import { Effect, pipe } from 'effect'
import type { Changeset } from 'json-diff-ts'
import { applyChangeset } from 'json-diff-ts'

export function getEditSuggestionData(suggestion_id: string) {
	const session = auth.getSession()

	return pipe(
		Effect.tryPromise({
			try: () =>
				editSuggestionPreviewQuery.run(session.client, {
					suggestion_id,
				}),
			catch: (error) => console.log('Failed fetching suggestion\n', error),
		}),
		...buildTraceAndMetrics('suggestion_page', {
			suggestion_id,
		}),
	).pipe(
		Effect.flatMap((data) => {
			if (!data || !data.target_object) return Effect.fail(new NotFoundError())

			return Effect.succeed(data)
		}),
		Effect.map((data) => {
			const diff = data.diff as Changeset

			const currentVegetable = vegetableEditingToForDBWithImages(
				data.target_object,
			)
			const withChangesApplied = applyChangeset(
				structuredClone(currentVegetable),
				diff,
			) as VegetableForDBWithImages
			const toRender =
				data.status === 'MERGED'
					? data.target_object
					: // We run the diffs against the freshest version, so applied diffs won't carry anything stale from the EditSuggestion's `snapshot`
						withChangesApplied
			const dataThatChanged = getChangedObjectSubset({
				prev: currentVegetable,
				next: withChangesApplied,
			})

			return {
				...data,
				diff,
				toRender,
				dataThatChanged,
				currentVegetable,
			}
		}),
	)
}
