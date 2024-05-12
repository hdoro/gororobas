import { cn as tvcn, type CnOptions } from 'tailwind-variants'

export function cn<T extends CnOptions>(...classes: T) {
  return tvcn(...classes)({})
}
