import { auth } from '@/edgedb'
import type { $infer } from '@/edgeql'
import { Effect, pipe } from 'effect'
import { buildTraceAndMetrics } from './runtime'

export interface QueryError {
  readonly _tag: 'QueryError'
  readonly error: unknown
}

export interface AuthSessionError {
  readonly _tag: 'AuthSessionError'
  readonly error: unknown
}

export const QueryError = (error: unknown): QueryError => ({
  _tag: 'QueryError',
  error,
})

export const AuthSessionError = (error: unknown): AuthSessionError => ({
  _tag: 'AuthSessionError',
  error,
})

/**
 * Runs an EdgeDB query with Effect, handling session management and error cases
 * @param query EdgeDB query object from codegen
 * @param params Query parameters
 * @param options Additional options like metrics
 */
export function runQuery<
  Q extends { run(client: any, params: P): Promise<R> },
  P = undefined,
  R = $infer<Q>,
>(
  query: Q,
  params: P,
  options: {
    metricsName: string
    metricsData?: Record<string, string>
  },
) {
  return pipe(
    Effect.tryPromise({
      try: () => auth.getSession(),
      catch: (error) => Effect.fail(AuthSessionError(error)),
    }).pipe(...buildTraceAndMetrics('run_query_auth')),

    Effect.flatMap((session) =>
      pipe(
        Effect.tryPromise({
          try: () => query.run(session.client, params),
          catch: (error) => Effect.fail(QueryError(error)),
        }),
        ...buildTraceAndMetrics(
          `${options.metricsName}_query`,
          options.metricsData ?? {},
        ),
      ),
    ),
  )
}
