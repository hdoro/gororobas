import type { USAGE_TO_LABEL } from '@/utils/labels'

export type VegetableUsage = keyof typeof USAGE_TO_LABEL

export type FormOption = {
  value: string
  label: string
  description?: string
}
