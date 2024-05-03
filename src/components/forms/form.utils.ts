import type { FieldApi } from '@tanstack/react-form'

export function getFieldId(
  fieldOrName: FieldApi<any, any> | string,
  formId?: string,
) {
  const name = typeof fieldOrName === 'string' ? fieldOrName : fieldOrName.name
  return `field-${formId}-${name}`
}
