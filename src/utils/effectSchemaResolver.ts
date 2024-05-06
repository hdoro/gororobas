import { formatError, type Issue } from '@effect/schema/ArrayFormatter'
import * as S from '@effect/schema/Schema'
import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers'
import { Effect } from 'effect'
import {
  FieldValues,
  ResolverOptions,
  ResolverResult,
  type FieldError,
  type FieldErrors,
} from 'react-hook-form'

type Resolver = <FormSchema extends S.Struct<any>>(
  schema: FormSchema,
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>

// @TODO: what's the effect of this?
const TAG_TO_TYPE_MAP: Partial<Record<Issue['_tag'], FieldError['type']>> = {
  Missing: 'required',
  Refinement: 'pattern',
}

export const effectSchemaResolverResolver: Resolver =
  (formSchema) => async (values, context, options) => {
    // react-hook-form will handle throwing errors for native validation
    options.shouldUseNativeValidation && validateFieldsNatively({}, options)

    const getResult = Effect.gen(function* () {
      console.log({ formSchema, values, context, options })
      const decoded = yield* S.decodeUnknown(formSchema, {
        errors: 'all',
      })(values)

      return {
        errors: {},
        values: decoded as FieldValues,
      } satisfies ResolverResult
    }).pipe(
      Effect.catchAll((e) =>
        formatError(e).pipe(
          Effect.map((errors) => {
            console.log({ errors })
            const fieldErrors: FieldErrors = Object.fromEntries(
              errors.flatMap((e, i) => {
                // Skip optional errors about undefined values
                if (
                  i > 0 &&
                  e.message.toLowerCase().startsWith('expected undefined')
                )
                  return []

                return [
                  [
                    e.path.join('.'),
                    {
                      message:
                        e.message === 'is mising' ? 'Obrigatório' : e.message,
                      type: TAG_TO_TYPE_MAP[e._tag] || 'validate',
                    } satisfies FieldError,
                  ],
                ]
              }),
            )
            return {
              errors: toNestErrors(fieldErrors, options),
              values: {},
            } satisfies ResolverResult
          }),
        ),
      ),
    )

    return Effect.runPromise(
      // @ts-expect-error We know `E / context` is unknown
      getResult,
    )
  }
