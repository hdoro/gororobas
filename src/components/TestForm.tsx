import { Gender, Vegetable } from '@/schemas'
import { USAGE_TO_LABEL } from '@/utils/labels'
import schemaValidator from '@/utils/schemaValidator'
import * as S from '@effect/schema/Schema'
import { useForm } from '@tanstack/react-form'
import CheckboxesInput from './forms/CheckboxesInput'
import FormField from './forms/FormField'
import HandleInput from './forms/HandleInput'
import NumberInput from './forms/NumberInput'
import RadioGroupInput from './forms/RadioGroupInput'
import { getFieldId } from './forms/form.utils'
import { Button } from './ui/button'
import { Input } from './ui/input'

type FormValueDecoded = S.Schema.Type<typeof Vegetable>
type FormDefaultValue = Partial<FormValueDecoded>

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
 * - [ ] Different number formatters
 * - [ ] Finish schema
 * - [ ] Field IDs
 * - [ ] Field dependency - edible_parts only if `ALIMENTO_HUMANO` in `usage`
 * - [ ] Async validation
 * - [ ] Default values
 * - [ ] Arrays
 * - [ ] Objects
 *
 * ## IMPROVEMENTS
 * - [ ] Less hacky approach to validating optionals
 * - [ ] Numbers from text fields (I think number inputs have bunch of issues, don't remember why)
 */
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
                id={getFieldId(field)}
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
              <FormField field={field} label="Altura adulta mínima">
                <NumberInput field={field} format="centimeters" />
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
              <FormField field={field} label="Altura adulta máxima">
                <NumberInput field={field} format="centimeters" />
              </FormField>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="temperature_min"
            validators={{
              // @ts-expect-error @TODO find way to type this
              onChange: Vegetable.fields.temperature_min,
            }}
            children={(field) => (
              <FormField field={field} label="Temperatura ideal mínima">
                <NumberInput field={field} format="temperature" />
              </FormField>
            )}
          />
          <form.Field
            name="temperature_max"
            validators={{
              // @ts-expect-error @TODO find way to type this
              onChange: Vegetable.fields.temperature_max,
            }}
            children={(field) => (
              <FormField field={field} label="Temperatura ideal máxima">
                <NumberInput field={field} format="centimeters" />
              </FormField>
            )}
          />
        </div>
        <Button type="submit">Enviar</Button>
      </form>
    </div>
  )
}
