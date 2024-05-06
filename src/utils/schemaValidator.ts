import { formatError } from '@effect/schema/ArrayFormatter'
import * as S from '@effect/schema/Schema'
import { type ValidationError } from '@tanstack/react-form'
import { Effect, Either, pipe } from 'effect'

const schemaValidator = () => {
  return {
    validate: <A, FieldSchema extends S.Schema<A, unknown, never>>(
      { value }: { value: A },
      fieldSchema:
        | FieldSchema
        | S.PropertySignature<'?:', A, never, '?:', A, never>,
    ): ValidationError => {
      const toValidate =
        '_TypeToken' in fieldSchema
          ? {
              schema: S.Struct({
                field: fieldSchema,
              }),
              value: { field: value },
            }
          : { schema: fieldSchema, value }
      // @ts-expect-error @TODO find way to type this
      const result = S.decodeUnknownEither(toValidate.schema)(toValidate.value)
      console.log({ result })

      // const result = S.decodeUnknownEither(fieldSchema)(value)
      if (Either.isLeft(result)) {
        const errors = Effect.runSync(formatError(result.left))
        console.log({ errors })
        return errors
          .flatMap((e, i) => {
            // Skip optional errors about undefined values
            if (
              i > 0 &&
              e.message.toLowerCase().startsWith('expected undefined')
            )
              return []

            return e.message
          })
          .join(';\n')
      }
    },
    async validateAsync<A, FieldSchema extends S.Schema<A, unknown, never>>(
      { value }: { value: A },
      fieldSchema: FieldSchema,
    ): Promise<ValidationError> {
      const result = await Effect.runPromise(
        pipe(
          S.decodeUnknown(fieldSchema)(value),

          // If the result is a right, return undefined
          Effect.map(() => undefined),

          // Else, we format the error and return it to the form
          Effect.catchAll((e) =>
            formatError(e).pipe(
              Effect.map((errors) => errors.map((e) => e.message).join(';\n')),
            ),
          ),
        ),
      )

      return result
    },
  }
}

export default schemaValidator
