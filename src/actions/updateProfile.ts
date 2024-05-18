'use server'

import { auth } from '@/edgedb'
import { newSourcesMutation, updateProfileMutation } from '@/mutations'
import { NewImage, ProfileData, type ProfileDataForDB } from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Schema } from '@effect/schema'
import type { Client } from 'edgedb'
import { Effect, pipe } from 'effect'

export async function updateProfileAction(input: Partial<ProfileDataForDB>) {
	const session = auth.getSession()

	if (!Schema.is(Schema.partial(ProfileData))(input))
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
			Effect.catchAll(() => Effect.succeed({ error: 'unknown-error' })),
		),
	)
}

function getTransaction(input: Partial<ProfileDataForDB>, inputClient: Client) {
	const client = inputClient.withConfig({ allow_user_specified_id: true })

	return client.transaction(async (tx) => {
		// #1 CREATE ALL SOURCES
		const allSources = [...(input.photo?.sources || [])]
		if (allSources.length > 0) {
			await newSourcesMutation.run(tx, {
				sources: allSources,
			})
		}

		const { photo } = input
		if (Schema.is(NewImage)(photo?.data)) {
			// @TODO upload to Sanity
			// await newImagesMutation.run(tx, {
			// 	images: [
			// 		{
			// 			id: photo.id,
			// 			label: photo.label || '',
			// 			sanity_id: photo.data.sanity_id,
			// 			sources: photo.sources?.map((s) => s.id) || [],
			// 		},
			// 	],
			// })
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
