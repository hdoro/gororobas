/**
 * Adaptation of @hookform/adapters' implementation of the Effect schema resolver - L#39
 *
 * @see https://github.com/react-hook-form/resolvers/blob/master/effect-ts/src/effect-ts.ts
 */

import type { Schema } from '@effect/schema'
import type { ParseOptions } from '@effect/schema/AST'
import { formatIssue } from '@effect/schema/ArrayFormatter'
import { decodeUnknown } from '@effect/schema/ParseResult'
import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers'
import * as Effect from 'effect/Effect'
import type { FieldErrors } from 'react-hook-form'
import type {
	FieldValues,
	ResolverOptions,
	ResolverResult,
} from 'react-hook-form'

export type Resolver = <A extends FieldValues, I, TContext>(
	schema: Schema.Schema<A, I>,
	config?: ParseOptions,
) => (
	values: FieldValues,
	_context: TContext | undefined,
	options: ResolverOptions<A>,
) => Promise<ResolverResult<A>>

export const effectTsResolver: Resolver =
	(schema, config = { errors: 'all', onExcessProperty: 'ignore' }) =>
	(values, _, options) => {
		return decodeUnknown(
			schema,
			config,
		)(values).pipe(
			Effect.catchAll((parseIssue) => Effect.flip(formatIssue(parseIssue))),
			Effect.mapError((issues) => {
				/** ADAPTATION: Removes parent issues when a more specific issue is available in children */
				const displayableIssues = issues.filter((issue, index) => {
					const hasMoreSpecificIssue = issues.some(
						(otherIssue, otherIndex) =>
							otherIndex !== index &&
							otherIssue.path.length >= issue.path.length &&
							otherIssue.path.slice(0, issue.path.length).join('.') ===
								issue.path.join('.'),
					)

					return !hasMoreSpecificIssue
				})
				const errors = displayableIssues.reduce((acc, current) => {
					const key = current.path.join('.')
					acc[key] = { message: current.message, type: current._tag }
					return acc
				}, {} as FieldErrors)

				return toNestErrors(errors, options)
			}),
			Effect.tap(() =>
				Effect.sync(
					() =>
						options.shouldUseNativeValidation &&
						validateFieldsNatively({}, options),
				),
			),
			Effect.match({
				onFailure: (errors) => ({ errors, values: {} }),
				onSuccess: (result) => ({ errors: {}, values: result }),
			}),
			Effect.runPromise,
		)
	}
