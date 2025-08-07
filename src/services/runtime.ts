import { Effect, Metric } from 'effect'
import type { SpanOptions } from 'effect/Tracer'
import { configureRequestLocale } from '@/utils/i18n.server'
import { TracingLive } from './Tracing'

export async function runServerEffect<A, E>(
  effect: Effect.Effect<A, E, never>,
): Promise<A> {
  // Ensure every effect ran in the server has access to the proper getLocale function, no matter the NextJS runtime
  try {
    await configureRequestLocale()
  } catch (_error) {}

  return await Effect.runPromise(
    Effect.provide(effect, TracingLive) as Effect.Effect<A, E, never>,
  )
}

export function buildTraceAndMetrics(
  /* snake_case_no_special_character */
  endpoint_id: string,
  spanAttributes?: SpanOptions['attributes'],
) {
  const metrics = {
    duration: Metric.timer(`${endpoint_id}_duration`),
    failures: Metric.counter(`${endpoint_id}_errors`, { incremental: true }),
    success: Metric.counter(`${endpoint_id}_successes`, { incremental: true }),
  }

  return [
    Metric.trackDuration(metrics.duration),
    // @TODO: reactivate tracking success & error once type inference is fixed
    // Metric.trackSuccessWith(metrics.success, () => 1),
    // Metric.trackErrorWith(metrics.success, () => 1),
    Effect.withSpan(endpoint_id, { attributes: spanAttributes }),
    Effect.withLogSpan(endpoint_id),
  ] as const
}
