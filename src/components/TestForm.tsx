import type { VegetableUsage } from '@/types'
import { USAGE_TO_LABEL } from '@/utils/labels'
import { formatError } from '@effect/schema/ArrayFormatter'
import * as S from '@effect/schema/Schema'
import { useForm, type ValidationError } from '@tanstack/react-form'
import { Effect, Either, pipe } from 'effect'
import { MAX_ACCEPTED_HEIGHT } from '../utils/numbers'
import CheckboxesInput from './forms/CheckboxesInput'
import FormField from './forms/FormField'
import HandleInput from './forms/HandleInput'
import NumberInput from './forms/NumberInput'
import RadioGroupInput from './forms/RadioGroupInput'
import { Button } from './ui/button'
import { Input } from './ui/input'

enum Gender {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
  NEUTRO = 'NEUTRO',
}

/**
 * FORM REQUIREMENTS:
 *
 * - [x] Validation
 * - [x] Submit
 * - [x] Different error messages for different validations
 * - [x] Optional fields
 *    - S.Optional() makes it hard to validate
 *    - Options:
 *      - Use S.Union
 *          - 👎 when there's one error, all error messages show
 *          - 👎 harder to use, less readable
 *      - Learn how to work with S.Optional() -> PropertySignatures went a bit over my head 🥴
 *      - Validate a S.struct with the optional field -> TS is complaining, but it works
 * - [x] Height field
 * - [x] Handle input
 * - [ ] Field IDs
 * - [ ] Async validation
 * - [ ] Default values
 * - [ ] Arrays
 * - [ ] Objects
 *
 * ## IMPROVEMENTS
 * - [ ] Less hacky approach to validating optionals
 * - [ ] Numbers from text fields (I think number inputs have bunch of issues, don't remember why)
 */

const Vegetable = S.Struct({
  names: S.Array(S.String.pipe(S.minLength(1))).pipe(S.minItems(1)),
  handle: S.String.pipe(
    S.minLength(1, {
      message: () => 'Obrigatório',
    }),
    S.minLength(3, {
      message: () => 'Obrigatório (mínimo de 3 caracteres)',
    }),
    S.pattern(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/, {
      message: () =>
        'O endereço não pode conter caracteres especiais, letras maiúsculas, espaços ou acentos',
    }),
  ),
  scientific_name: S.String.pipe(
    S.minLength(1, {
      message: () => 'Obrigatório',
    }),
    S.minLength(3, {
      message: () => 'Obrigatório (mínimo de 3 caracteres)',
    }),
  ),
  gender: S.Enums(Gender).annotations({
    message: () => 'Obrigatório',
    jsonSchema: {
      blabla: 'bleble',
    },
  }),
  usage: S.Array(
    S.Literal(...(Object.keys(USAGE_TO_LABEL) as VegetableUsage[])),
  )
    .pipe(S.minItems(1))
    .annotations({
      message: () => 'Marque ao menos um uso',
    }),
  height_min: S.optional(
    S.Int.pipe(
      S.positive({ message: () => 'Altura deve ser um número positivo' }),
      S.lessThan(MAX_ACCEPTED_HEIGHT, {
        message: () => 'Que vegetal gigante e louco é esse?!',
      }),
    ),
  ),
  height_max: S.optional(
    S.Int.pipe(
      S.positive({ message: () => 'Altura deve ser um número positivo' }),
      S.lessThan(MAX_ACCEPTED_HEIGHT, {
        message: () => 'Que vegetal gigante e louco é esse?!',
      }),
    ),
  ),
})

type FormValueDecoded = S.Schema.Type<typeof Vegetable>
type FormDefaultValue = Partial<FormValueDecoded>

const schemaValidator = () => {
  return {
    validate: <A, FieldSchema extends S.Schema<A, any, never>>(
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
    async validateAsync<A, FieldSchema extends S.Schema<A, any, never>>(
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

export default function TestForm() {
  const form = useForm<FormValueDecoded>({
    options: {},
    // @ts-expect-error @TODO find way to type this
    validatorAdapter: schemaValidator,
    onSubmit: async ({ value, formApi }) => {
      // Do something with form data
      console.log({ submitted: value })
    },
  })

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        <form.Field
          name="handle"
          validators={{
            // @ts-expect-error @TODO find way to type this
            onChange: Vegetable.fields.handle,
          }}
          children={(field) => (
            <FormField field={field} label="Endereço no site">
              <HandleInput field={field} path="vegetais" />
            </FormField>
          )}
        />
        <form.Field
          name="scientific_name"
          validators={{
            // @ts-expect-error @TODO find way to type this
            onChange: Vegetable.fields.scientific_name,
          }}
          children={(field) => (
            <FormField field={field} label="Nome científico">
              <Input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </FormField>
          )}
        />
        <form.Field
          name="gender"
          validators={{
            // @ts-expect-error @TODO find way to type this
            onChange: Vegetable.fields.gender,
          }}
          children={(field) => (
            <FormField field={field} label="Gênero gramatical">
              <RadioGroupInput
                field={field}
                options={[
                  { label: 'Feminino', value: Gender.FEMININO },
                  { label: 'Masculino', value: Gender.MASCULINO },
                  { label: 'Neutro', value: Gender.NEUTRO },
                ]}
              />
            </FormField>
          )}
        />
        <form.Field
          name="usage"
          validators={{
            // @ts-expect-error @TODO find way to type this
            onChange: Vegetable.fields.usage,
          }}
          children={(field) => (
            <FormField field={field} label="Principais usos">
              <CheckboxesInput
                field={field}
                options={Object.entries(USAGE_TO_LABEL).map(
                  ([value, label]) => ({ value, label }),
                )}
              />
            </FormField>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="height_min"
            validators={{
              // @ts-expect-error @TODO find way to type this
              onChange: Vegetable.fields.height_min,
            }}
            children={(field) => (
              <FormField field={field} label="Altura mínima (cm)">
                <NumberInput field={field} />
              </FormField>
            )}
          />
          <form.Field
            name="height_max"
            validators={{
              // @ts-expect-error @TODO find way to type this
              onChange: Vegetable.fields.height_max,
            }}
            children={(field) => (
              <FormField field={field} label="Altura máxima (cm)">
                <NumberInput field={field} />
              </FormField>
            )}
          />
        </div>
        <Button type="submit">Enviar</Button>
      </form>
    </div>
  )
}
