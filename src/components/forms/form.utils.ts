import type { FieldApi } from '@tanstack/react-form'

export function getFieldId(
  fieldOrName: FieldApi<any, any> | string,
  formId?: string,
) {
  const name = typeof fieldOrName === 'string' ? fieldOrName : fieldOrName.name
  return `field-${formId || ''}-${name}`
}

export function getFieldLabelId(
  fieldOrName: FieldApi<any, any> | string,
  formId?: string,
) {
  return `${getFieldId(fieldOrName, formId)}-label`
}

export function getFieldDescriptionId(
  fieldOrName: FieldApi<any, any> | string,
  formId?: string,
) {
  return `${getFieldId(fieldOrName, formId)}-description`
}

export function getFieldProps(
  field: FieldApi<any, any>,
  formId?: string,
): Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'id' | 'aria-describedby' | 'aria-invalid' | 'name'
> {
  return {
    name: field.name,
    id: getFieldId(field, formId),
    'aria-invalid': field.state.meta.errors.length > 0,

    /** `describedby` instead of `aria-labelledby` so we can point correct labels in radio
     * and checkboxes, where there are labels for both the field and the option */
    'aria-describedby': [
      getFieldLabelId(field, formId),
      // @TODO: include if we ever use field descriptions
      // getFieldDescriptionId(field, formId),
    ].join(' '),
  }
}
