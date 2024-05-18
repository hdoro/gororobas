'use server'

import { auth } from '@/edgedb'
import { vegetablesForReferenceQuery } from '@/queries'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import type { ReferenceOption } from '@/types'
import { Effect, pipe } from 'effect'

export type ReferenceObjectType = 'Vegetable'

export async function listReferenceOptions(
	// @TODO: handle objectType when adding users
	objectType: ReferenceObjectType,
): Promise<ReferenceOption[] | { error: string }> {
	const session = auth.getSession()

	return runServerEffect(
		pipe(
			Effect.tryPromise({
				try: () => vegetablesForReferenceQuery.run(session.client),
				catch: (error) => {
					console.log('Failed listing reference options', error)
				},
			}),
			Effect.map((vegetables) =>
				vegetables.map(
					(vegetable) =>
						({
							id: vegetable.id,
							label: vegetable.label,
							image: vegetable.photos[0],
						}) satisfies ReferenceOption,
				),
			),
			...buildTraceAndMetrics('list_reference_options', { objectType }),
			Effect.catchAll(() =>
				Effect.succeed({
					error: 'couldnt-fetch',
				} as const),
			),
		),
	)
}
