import { Gender, Vegetable } from '@/schemas'
import {
  EDIBLE_PART_TO_LABEL,
  PLANTING_METHOD_TO_LABEL,
  STRATUM_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import * as S from '@effect/schema/Schema'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import ArrayInput from './forms/ArrayInput'
import CheckboxesInput from './forms/CheckboxesInput'
import Field from './forms/Field'
import HandleInput from './forms/HandleInput'
import RadioGroupInput from './forms/RadioGroupInput'
import { Button } from './ui/button'
import { Input } from './ui/input'
import NumberInput from './forms/NumberInput'
import { effectSchemaResolverResolver } from '@/utils/effectSchemaResolver'
import PhotoWithCreditsInput from './forms/PhotoWithCreditsInput'

type FormValueDecoded = S.Schema.Type<typeof Vegetable>

/**
 * FORM REQUIREMENTS:
 *
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
 * - [x] Arrays
 * - [ ] Validation
 * - [ ] Objects
 * - [ ] Arrays of objects
 * - [ ] Form for photo with credits
 * - [ ] Image input
 * - [ ] Form for variety
 * - [ ] Rich text
 * - [ ] Suggestions & tips
 * - [ ] Finish schema
 * - [ ] Field dependency - edible_parts only if `ALIMENTO_HUMANO` in `usage`
 * - [ ] Async validation
 * - [ ] Default values
 *
 * ## IMPROVEMENTS
 * - [ ] Less hacky approach to validating optionals
 * - [ ] Numbers from text fields (I think number inputs have bunch of issues, don't remember why)
 */
export default function TestForm() {
  const form = useForm<FormValueDecoded>({
    resolver: effectSchemaResolverResolver(Vegetable),
    defaultValues: {
      names: [{ value: '' }],
    },
  })

  const onSubmit: SubmitHandler<FormValueDecoded> = (data, event) => {
    console.info({ data, event })
  }

  console.log(form.formState, form.getValues())

  return (
    <div>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Field
            label="Nomes"
            name="names"
            form={form}
            render={({ field }) => (
              <ArrayInput
                field={field}
                newItemValue={{ value: '' }}
                newItemLabel="Novo nome"
                renderItem={(index) => (
                  <Field
                    form={form}
                    name={`${field.name}.${index}.value`}
                    label=""
                    render={({ field: subField }) => <Input {...subField} />}
                  />
                )}
              />
            )}
          />
          <Field
            form={form}
            name="handle"
            label="Endereço no site"
            render={({ field }) => (
              <HandleInput field={field} path="vegetais" />
            )}
          />
          <Field
            form={form}
            name="scientific_name"
            label="Nome científico"
            render={({ field }) => (
              <Input {...field} value={field.value || ''} type="text" />
            )}
          />
          <Field
            form={form}
            name="origin"
            label="Origem"
            render={({ field }) => (
              <Input {...field} value={field.value || ''} type="text" />
            )}
          />
          <Field
            form={form}
            name="gender"
            label="Gênero gramatical"
            render={({ field }) => (
              <RadioGroupInput
                field={field}
                options={[
                  { label: 'Feminino', value: Gender.FEMININO },
                  { label: 'Masculino', value: Gender.MASCULINO },
                  { label: 'Neutro', value: Gender.NEUTRO },
                ]}
              />
            )}
          />
          <Field
            form={form}
            name="usage"
            label="Principais usos"
            render={({ field }) => (
              <CheckboxesInput
                field={field}
                options={Object.entries(USAGE_TO_LABEL).map(
                  ([value, label]) => ({ value, label }),
                )}
              />
            )}
          />
          <Field
            form={form}
            name="edible_parts"
            label="Partes comestíveis"
            render={({ field }) => (
              <CheckboxesInput
                field={field}
                options={Object.entries(EDIBLE_PART_TO_LABEL).map(
                  ([value, label]) => ({ value, label }),
                )}
              />
            )}
          />
          <Field
            form={form}
            name="lifecycle"
            label="Partes comestíveis"
            render={({ field }) => (
              <CheckboxesInput
                field={field}
                options={Object.entries(VEGETABLE_LIFECYCLE_TO_LABEL).map(
                  ([value, label]) => ({ value, label }),
                )}
              />
            )}
          />
          <Field
            form={form}
            name="stratum"
            label="Partes comestíveis"
            render={({ field }) => (
              <CheckboxesInput
                field={field}
                options={Object.entries(STRATUM_TO_LABEL).map(
                  ([value, label]) => ({ value, label }),
                )}
              />
            )}
          />
          <Field
            form={form}
            name="planting_method"
            label="Plantio por"
            render={({ field }) => (
              <CheckboxesInput
                field={field}
                options={Object.entries(PLANTING_METHOD_TO_LABEL).map(
                  ([value, label]) => ({ value, label }),
                )}
              />
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              form={form}
              name="height_min"
              label="Altura adulta mínima"
              render={({ field }) => (
                <NumberInput field={field} format="centimeters" />
              )}
            />
            <Field
              form={form}
              name="height_max"
              label="Altura adulta máxima"
              render={({ field }) => (
                <NumberInput field={field} format="centimeters" />
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              form={form}
              name="temperature_min"
              label="Temperatura ideal mínima"
              render={({ field }) => (
                <NumberInput field={field} format="temperature" />
              )}
            />
            <Field
              form={form}
              name="temperature_max"
              label="Temperatura ideal máxima"
              render={({ field }) => (
                <NumberInput field={field} format="temperature" />
              )}
            />
          </div>

          <Field
            form={form}
            name="photo_test"
            label="Foto teste"
            render={({ field }) => <PhotoWithCreditsInput field={field} />}
          />

          <Button type="submit">Enviar</Button>
        </form>
      </FormProvider>
    </div>
  )
}
