import { Config, Context, Data, Effect, Layer } from 'effect'
import { MailpitClient } from 'mailpit-api'

export class MailpitError extends Data.TaggedError('MailpitError')<{
  cause?: unknown
  message?: string
}> {}

interface MailpitImpl {
  use: <T>(
    fn: (client: MailpitClient) => T,
  ) => Effect.Effect<Awaited<T>, MailpitError, never>
}
export class Mailpit extends Context.Tag('Mailpit')<Mailpit, MailpitImpl>() {}

const make = (
  baseURL: string,
  auth: ConstructorParameters<typeof MailpitClient>[1],
) =>
  Effect.gen(function* () {
    const client = new MailpitClient(baseURL, auth)
    return Mailpit.of({
      use: (fn) =>
        Effect.gen(function* () {
          const result = yield* Effect.try({
            try: () => fn(client),
            catch: (e) =>
              new MailpitError({
                cause: e,
                message: 'Syncronous error in `Mailpit.use`',
              }),
          })
          if (result instanceof Promise) {
            return yield* Effect.tryPromise({
              try: () => result,
              catch: (e) =>
                new MailpitError({
                  cause: e,
                  message: 'Asyncronous error in `Mailpit.use`',
                }),
            })
          }

          return result
        }).pipe(
          Effect.tapError((error) =>
            Effect.logDebug('MailpitService.use failed', error.cause),
          ),
        ),
    })
  })

export const fromEnv = Layer.scoped(
  Mailpit,
  Effect.gen(function* () {
    const baseURL = yield* Config.string('MAILPIT_URL')
    return yield* make(baseURL, undefined)
  }),
)
