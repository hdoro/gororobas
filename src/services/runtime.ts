import { Effect, Metric } from 'effect'
import type { SpanOptions } from 'effect/Tracer'
import { TracingLive } from './Tracing'

export function runServerEffect<A, E, R>(
	effect: Effect.Effect<A, E, R>,
): Promise<A> {
	return Effect.runPromise(
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
		Metric.trackSuccessWith(metrics.success, () => 1),
		Metric.trackErrorWith(metrics.success, () => 1),
		Effect.withSpan(endpoint_id, { attributes: spanAttributes }),
		Effect.withLogSpan(endpoint_id),
	] as const
}
