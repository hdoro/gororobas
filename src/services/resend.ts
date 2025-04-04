import { Config, Context, Data, Effect, Layer } from 'effect'
import { Resend } from 'resend'

export class ResendError extends Data.TaggedError('ResendError')<{
  cause?: unknown
  message?: string
}> {}

interface ResendImpl {
  use: <T>(
    fn: (client: Resend) => T,
  ) => Effect.Effect<Awaited<T>, ResendError, never>
}
export class ResendService extends Context.Tag('Resend')<
  Resend,
  ResendImpl
>() {}

const make = (apiKey: string) =>
  Effect.gen(function* () {
    const client = new Resend(apiKey)
    return ResendService.of({
      use: (fn) =>
        Effect.gen(function* () {
          const result = yield* Effect.try({
            try: () => fn(client),
            catch: (e) =>
              new ResendError({
                cause: e,
                message: 'Syncronous error in `Resend.use`',
              }),
          })
          if (result instanceof Promise) {
            return yield* Effect.tryPromise({
              try: () => result,
              catch: (e) =>
                new ResendError({
                  cause: e,
                  message: 'Asyncronous error in `Resend.use`',
                }),
            })
          }

          return result
        }).pipe(
          Effect.tapError((error) =>
            Effect.logDebug('ResendService.use failed', error.cause),
          ),
        ),
    })
  })

export const fromEnv = Layer.scoped(
  ResendService,
  Effect.gen(function* () {
    const apiKey = yield* Config.string('RESEND_API_KEY')
    return yield* make(apiKey)
  }),
)
