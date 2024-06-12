'use server'

import { auth } from '@/edgedb'
import { rejectSuggestionMutation } from '@/mutations'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Schema } from '@effect/schema'
import { Effect, pipe } from 'effect'

export async function rejectEditSuggestionAction({
	suggestion_id,
}: { suggestion_id: string }) {
	if (!Schema.is(Schema.UUID)(suggestion_id)) {
		return false
	}

	const session = auth.getSession()

	return runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () =>
					rejectSuggestionMutation.run(session.client, { suggestion_id }),
				catch: (error) => {
					console.log(error)
					return error
				},
			}),
			Effect.map(() => true),
			...buildTraceAndMetrics('reject_edit_suggestion', {
				suggestion_id,
			}),
		).pipe(Effect.catchAll(() => Effect.succeed(false))),
	)
}
