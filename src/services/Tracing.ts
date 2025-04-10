import * as DevTools from '@effect/experimental/DevTools'
import * as NodeSdk from '@effect/opentelemetry/NodeSdk'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Config, Effect, FiberRef, Layer, LogLevel, Redacted } from 'effect'

// `nested` means secrets are prefixed by `HONEYCOMB_`
const HoneycombConfig = Config.nested('HONEYCOMB')(
  Config.all({
    apiKey: Config.redacted('API_KEY'),
    serviceName: Config.redacted('DATASET'),
  }),
)

export const TracingLive = Layer.unwrapEffect(
  Effect.gen(function* (_) {
    const config = yield* _(Config.option(HoneycombConfig))
    if (config._tag !== 'Some') {
      return DevTools.layer().pipe(
        Layer.locally(FiberRef.currentMinimumLogLevel, LogLevel.None),
      )
    }

    const { apiKey, serviceName } = config.value
    const headers = {
      'X-Honeycomb-Team': Redacted.value(apiKey),
      'X-Honeycomb-Dataset': Redacted.value(serviceName),
    }

    return NodeSdk.layer(() => ({
      resource: {
        serviceName: Redacted.value(serviceName),
      },
      spanProcessor: new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: 'https://api.honeycomb.io/v1/traces',
          headers,
        }),
      ),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: 'https://api.honeycomb.io/v1/metrics',
          headers,
        }),
        exportIntervalMillis: 5000,
      }),
    }))
  }),
)
