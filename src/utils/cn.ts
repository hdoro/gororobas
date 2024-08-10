import { twMerge } from 'tailwind-merge'
import type { CnOptions } from 'tailwind-variants'

export function cn<T extends CnOptions>(...classes: T) {
  return twMerge(...classes)
}
