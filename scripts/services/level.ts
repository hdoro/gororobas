import { Context, Data, Effect, Layer, Schema } from 'effect'
import type { ParseError } from 'effect/ParseResult'
import { Level as LevelDB } from 'level'

export class LevelError extends Data.TaggedError('LevelError')<{
  cause?: unknown
  message?: string
}> {}

interface LevelImpl {
  use: <T>(
    fn: (client: LevelDB<unknown, unknown>) => T,
  ) => Effect.Effect<Awaited<T>, LevelError, never>

  /** Auto-encodes the value using the provided schema */
  put: <A, I>(props: {
    key: string
    value: Schema.Schema.Type<Schema.Schema<A, I, never>>
    schema: Schema.Schema<A, I, never>
  }) => Effect.Effect<void, LevelError | ParseError, never>

  /** Auto-decodes the stored JSON value. Returns undefined if value doesn't match schema. */
  get: <A, I>(props: {
    key: string
    schema: Schema.Schema<A, I, never>
  }) => Effect.Effect<
    Schema.Schema.Type<Schema.Schema<A, I, never>> | undefined,
    LevelError,
    never
  >
}
export class Level extends Context.Tag('Level')<Level, LevelImpl>() {}

type LevelClientOptions = ConstructorParameters<typeof LevelDB>[1]

const make = (path: string, options?: LevelClientOptions) =>
  Effect.gen(function* () {
    const client = new LevelDB(path, options)

    const use: LevelImpl['use'] = (fn) =>
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
      })
    return Level.of({
      use,
      put: (props) =>
        Effect.gen(function* () {
          const encoded = yield* Schema.encode(Schema.parseJson(props.schema))(
            props.value,
          )
          yield* use((client) => client.put(props.key, encoded))
        }).pipe(Effect.annotateLogs('Level.put', path)),
      get: (props) =>
        Effect.gen(function* () {
          const result = yield* use((client) => client.get(props.key))

          if (typeof result === 'string') {
            return yield* Schema.decode(Schema.parseJson(props.schema))(
              result,
            ).pipe(
              Effect.tapErrorTag('ParseError', Effect.logError),
              Effect.catchTag('ParseError', () => Effect.succeed(undefined)),
            )
          }

          return undefined
        }).pipe(Effect.annotateLogs('Level.get', path)),
    })
  })

export const layer = (path: string, options?: LevelClientOptions) =>
  Layer.scoped(Level, make(path, options))
