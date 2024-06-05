'use server'

import { auth } from '@/edgedb'
import { insertSourcesMutation, updateProfileMutation } from '@/mutations'
import { ProfileDataToUpdate } from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Schema } from '@effect/schema'
import type { Client } from 'edgedb'
import { Effect, pipe } from 'effect'

export async function updateProfileAction(
	input: typeof ProfileDataToUpdate.Type,
) {
	const session = auth.getSession()

	if (!Schema.is(ProfileDataToUpdate)(input))
		return {
			error: 'invalid-input',
		} as const

	return runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => getTransaction(input, session.client),
				catch: (error) => {
					console.log('Failed updating profile', error)
				},
			}),
			Effect.map(() => true),
			...buildTraceAndMetrics('edit_profile'),
			Effect.catchAll(() =>
				Effect.succeed({ error: 'unknown-error' } as const),
			),
		),
	)
}

function getTransaction(
	input: typeof ProfileDataToUpdate.Type,
	inputClient: Client,
) {
	const client = inputClient.withConfig({ allow_user_specified_id: true })

	return client.transaction(async (tx) => {
		// #1 CREATE ALL SOURCES
		const allSources = [...(input.photo?.sources || [])]
		if (allSources.length > 0) {
			await insertSourcesMutation.run(tx, {
				sources: allSources,
			})
		}

		await updateProfileMutation.run(tx, {
			bio: input.bio ?? null,
			handle: input.handle ?? null,
			location: input.location ?? null,
			name: input.name ?? null,
			photo: input.photo?.id ?? null,
		})
	})
}
