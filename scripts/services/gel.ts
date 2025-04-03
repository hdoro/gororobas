import { Context, Data, Effect, Layer } from 'effect'
import { createClient, type Client } from 'gel'

export class GelError extends Data.TaggedError('GelError')<{
  cause?: unknown
  message?: string
}> {}

interface GelImpl {
  use: <T>(
    fn: (client: Client) => T,
  ) => Effect.Effect<Awaited<T>, GelError, never>
}
export class Gel extends Context.Tag('Gel')<Gel, GelImpl>() {}

type GelClientOptions = Parameters<typeof createClient>[0]

const make = (options: GelClientOptions) =>
  Effect.gen(function* () {
    const client = createClient(options)

    return Gel.of({
      use: (fn) =>
        Effect.gen(function* () {
          const result = yield* Effect.try({
            try: () => fn(client),
            catch: (e) =>
              new GelError({
                cause: e,
                message: 'Syncronous error in `Gel.use`',
              }),
          })
          if (result instanceof Promise) {
            return yield* Effect.tryPromise({
              try: () => result,
              catch: (e) =>
                new GelError({
                  cause: e,
                  message: 'Asyncronous error in `Gel.use`',
                }),
            })
          } else {
            return result
          }
        }).pipe(
          Effect.tapError((error) =>
            Effect.logDebug('Gel.use failed', error.cause),
          ),
        ),
    })
  })

export const layer = Layer.scoped(
  Gel,
  Effect.gen(function* () {
    return yield* make({
      // Note: when developing locally you will need to set tls security to
      // insecure, because the development server uses self-signed certificates
      // which will cause api calls with the fetch api to fail.
      tlsSecurity:
        process.env.NODE_ENV === 'development' ? 'insecure' : 'default',
      instanceName: process.env.EDGEDB_INSTANCE as string,
    })
  }),
)
