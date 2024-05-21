import { deleteNotesMutation } from '@/mutations'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { InvalidInputError } from '@/types/errors'
import { Schema } from '@effect/schema'
import type { Client } from 'edgedb'
import { Effect, pipe } from 'effect'

export const DeleteNotesInput = Schema.NonEmptyArray(Schema.UUID)

export function deleteNotes(
	input: typeof DeleteNotesInput.Type,
	client: Client,
) {
	return runServerEffect(
		Effect.gen(function* (_) {
			if (!Schema.is(DeleteNotesInput)(input)) {
				return yield* Effect.fail(
					new InvalidInputError(input, DeleteNotesInput),
				)
			}

			return yield* pipe(
				Schema.decode(DeleteNotesInput)(input),
				Effect.flatMap((noteIds) =>
					Effect.tryPromise({
						try: () => deleteNotesMutation.run(client, { noteIds }),
						catch: (error) => {
							console.log('Failed deleting notes', error)
						},
					}),
				),
				...buildTraceAndMetrics('delete_note', {
					count: input.length,
				}),
				Effect.map(() => true),
				Effect.catchAll(() => Effect.succeed(false)),
			)
		}),
	)
}
