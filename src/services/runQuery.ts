import type { $infer } from '@/edgeql'
import { auth } from '@/gel'
import { Effect, pipe } from 'effect'
import { buildTraceAndMetrics } from './runtime'

class QueryError {
  readonly _tag = 'QueryError'

  constructor(readonly error: unknown) {}
}

class AuthSessionError {
  readonly _tag = 'AuthSessionError'

  constructor(readonly error: unknown) {}
}

/**
 * Runs an GelDB query with Effect, handling session management and error cases
 * @param query GelDB query object from codegen
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
    metricsData?: Record<string, string | number>
  },
) {
  return pipe(
    Effect.tryPromise({
      try: () => auth.getSession(),
      catch: (error) => new AuthSessionError(String(error)),
    }).pipe(...buildTraceAndMetrics('run_query_auth')),

    Effect.andThen((session) =>
      Effect.tryPromise({
        try: () => query.run(session.client, params),
        catch: (error) => new QueryError(String(error)),
      }),
    ),

    ...buildTraceAndMetrics(
      `${options.metricsName}_query`,
      options.metricsData ?? {},
    ),
  )
}
