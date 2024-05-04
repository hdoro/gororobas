import { Gender, Vegetable } from '@/schemas'
import {
  EDIBLE_PART_TO_LABEL,
  PLANTING_METHOD_TO_LABEL,
  STRATUM_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import schemaValidator from '@/utils/schemaValidator'
import * as S from '@effect/schema/Schema'
import { useForm } from '@tanstack/react-form'
import ArrayInput from './forms/ArrayInput'
import CheckboxesInput from './forms/CheckboxesInput'
import FormField from './forms/FormField'
import HandleInput from './forms/HandleInput'
import NumberInput from './forms/NumberInput'
import RadioGroupInput from './forms/RadioGroupInput'
import TextInput from './forms/TextInput'
import { Button } from './ui/button'

type FormValueDecoded = S.Schema.Type<typeof Vegetable>

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
 * - [x] Different number formatters
 * - [x] Field IDs
 * - [ ] Arrays - Can't add items, issue with forms
 * - [ ] Objects
 * - [ ] Arrays of objects
 * - [ ] Finish schema
 * - [ ] Field dependency - edible_parts only if `ALIMENTO_HUMANO` in `usage`
 * - [ ] Async validation
 * - [ ] Default values
 *
 * ## IMPROVEMENTS
 * - [ ] Less hacky approach to validating optionals
 * - [ ] Numbers from text fields (I think number inputs have bunch of issues, don't remember why)
 * - [ ] Find a way of appending to `FieldAPI` so we can include unique `IDs` to them
 */
export default function TestForm() {
  const form = useForm<FormValueDecoded>({
    // @ts-expect-error @TODO find way of typing default values
    defaultValues: {
      names: [],
      varieties: [],
    },
    // @ts-expect-error @TODO find way to type this
    validatorAdapter: schemaValidator,
    onSubmit: async ({ value }) => {
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
          name="names"
          validators={{
            // @ts-expect-error @TODO find way to type this
            onChange: Vegetable.fields.names,
          }}
          children={(field) => (
            <FormField field={field} label="Nomes">
              <ArrayInput
                field={field}
                newItemValue={{ value: '' }}
                renderItem={(index) => (
                  <>
                    <form.Field name={`${field.name}[${index}].value`}>
                      {(subField) => <TextInput field={subField} />}
                    </form.Field>
                    <form.Field name={`${field.name}[${index}].id`}>
                      {(subField) => null}
                    </form.Field>
                  </>
                )}
              />
            </FormField>
          )}
        />
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
              <TextInput field={field} />
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
        {/* @TODO: make conditional */}
        <form.Field
          name="edible_parts"
          validators={{
            // @ts-expect-error @TODO find way to type this
            onChange: Vegetable.fields.edible_parts,
          }}
          children={(field) => (
            <FormField field={field} label="Partes comestíveis">
              <CheckboxesInput
                field={field}
                options={Object.entries(EDIBLE_PART_TO_LABEL).map(
                  ([value, label]) => ({ value, label }),
                )}
              />
            </FormField>
          )}
        />
        <form.Field
          name="lifecycle"
          validators={{
            // @ts-expect-error @TODO find way to type this
            onChange: Vegetable.fields.lifecycle,
          }}
          children={(field) => (
            <FormField field={field} label="Partes comestíveis">
              <CheckboxesInput
                field={field}
                options={Object.entries(VEGETABLE_LIFECYCLE_TO_LABEL).map(
                  ([value, label]) => ({ value, label }),
                )}
              />
            </FormField>
          )}
        />
        <form.Field
          name="stratum"
          validators={{
            // @ts-expect-error @TODO find way to type this
            onChange: Vegetable.fields.stratum,
          }}
          children={(field) => (
            <FormField field={field} label="Partes comestíveis">
              <CheckboxesInput
                field={field}
                options={Object.entries(STRATUM_TO_LABEL).map(
                  ([value, label]) => ({ value, label }),
                )}
              />
            </FormField>
          )}
        />
        <form.Field
          name="planting_method"
          validators={{
            // @ts-expect-error @TODO find way to type this
            onChange: Vegetable.fields.planting_method,
          }}
          children={(field) => (
            <FormField field={field} label="Plantio por">
              <CheckboxesInput
                field={field}
                options={Object.entries(PLANTING_METHOD_TO_LABEL).map(
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
        <form.Field
          name="varieties"
          mode="array"
          validators={{
            // @ts-expect-error @TODO find way to type this
            onChange: Vegetable.fields.varieties,
          }}
          children={(field) => (
            <FormField field={field} label="Variedades">
              <ArrayInput
                field={field}
                newItemValue={{
                  names: [],
                  photos: [],
                }}
                renderItem={(index) => {
                  return (
                    <div key={index}>
                      <form.Field
                        name={`${field.name}[${index}].names`}
                        children={(subField) => (
                          <FormField field={subField} label="Nomes">
                            <TextInput field={subField} />
                          </FormField>
                        )}
                      />
                      <form.Field
                        name={`${field.name}[${index}].photos`}
                        mode="array"
                        // @TODO: validate
                        children={(subField) => (
                          <FormField field={subField} label="Nomes">
                            <ArrayInput
                              field={field}
                              newItemValue={{
                                label: '',
                                photo: '',
                                sources: [],
                              }}
                              renderItem={(photoIndex) => (
                                <div key={photoIndex}>
                                  <form.Field
                                    name={`${field.name}[${index}].${subField.name}[${photoIndex}].label`}
                                    children={(photoSubField) => (
                                      <FormField
                                        field={photoSubField}
                                        label="Rótulo da imagem"
                                      >
                                        <TextInput field={photoSubField} />
                                      </FormField>
                                    )}
                                  />
                                </div>
                              )}
                            />
                          </FormField>
                        )}
                      />
                    </div>
                  )
                }}
              ></ArrayInput>
            </FormField>
          )}
        />
        <Button type="submit">Enviar</Button>
      </form>
    </div>
  )
}
