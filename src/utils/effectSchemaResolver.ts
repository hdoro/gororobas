import { formatError, type Issue } from '@effect/schema/ArrayFormatter'
import * as S from '@effect/schema/Schema'
import { validateFieldsNatively } from '@hookform/resolvers'
import { Effect } from 'effect'
import {
  Field,
  FieldErrors,
  FieldValues,
  InternalFieldName,
  ResolverOptions,
  ResolverResult,
  get,
  set,
  type FieldError,
} from 'react-hook-form'

type Resolver = <FormSchema extends S.Struct<any> | S.filter<S.Struct<any>>>(
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

/**
 * Adaptation of @hookform/resolvers official implementation to avoid validating native
 * errors more than once.
 *
 * @see https://github.com/react-hook-form/resolvers/blob/master/src/toNestErrors.ts */
const toNestErrors = <TFieldValues extends FieldValues>(
  errors: FieldErrors,
  options: ResolverOptions<TFieldValues>,
): FieldErrors<TFieldValues> => {
  const fieldErrors = {} as FieldErrors<TFieldValues>
  for (const path in errors) {
    const field = get(options.fields, path) as Field['_f'] | undefined
    const error = Object.assign(errors[path] || {}, {
      ref: field && field.ref,
    })

    if (isNameInFieldArray(options.names || Object.keys(errors), path)) {
      const fieldArrayErrors = Object.assign({}, get(fieldErrors, path))

      set(fieldArrayErrors, 'root', error)
      set(fieldErrors, path, fieldArrayErrors)
    } else {
      set(fieldErrors, path, error)
    }
  }

  return fieldErrors
}

const isNameInFieldArray = (
  names: InternalFieldName[],
  name: InternalFieldName,
) => names.some((n) => n.startsWith(name + '.'))

export const effectSchemaResolverResolver: Resolver =
  (formSchema) => async (values, _context, options) => {
    // react-hook-form will handle throwing errors for native validation
    options.shouldUseNativeValidation && validateFieldsNatively({}, options)

    const getResult = Effect.gen(function* () {
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
