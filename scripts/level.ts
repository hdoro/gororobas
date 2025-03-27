import { Context, Data, Effect, Layer } from 'effect'
import { Level as LevelDB } from 'level'

export class LevelError extends Data.TaggedError('LevelError')<{
  cause?: unknown
  message?: string
}> {}

interface LevelImpl {
  use: <T>(
    fn: (client: LevelDB<unknown, unknown>) => T,
  ) => Effect.Effect<Awaited<T>, LevelError, never>
}
export class Level extends Context.Tag('Level')<Level, LevelImpl>() {}

type LevelClientOptions = ConstructorParameters<typeof LevelDB>[1]

const make = (path: string, options?: LevelClientOptions) =>
  Effect.gen(function* () {
    const client = new LevelDB(path, options)
    return Level.of({
      use: (fn) =>
        Effect.gen(function* () {
          const result = yield* Effect.try({
            try: () => fn(client),
            catch: (e) =>
              new LevelError({
                cause: e,
                message: 'Syncronous error in `Level.use`',
              }),
          })
          if (result instanceof Promise) {
            return yield* Effect.tryPromise({
              try: () => result,
              catch: (e) =>
                new LevelError({
                  cause: e,
                  message: 'Asyncronous error in `Level.use`',
                }),
            })
          } else {
            return result
          }
        }),
    })
  })

export const layer = (path: string, options?: LevelClientOptions) =>
  Layer.scoped(Level, make(path, options))
