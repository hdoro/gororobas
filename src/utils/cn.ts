import { type CnOptions, cn as tvcn } from 'tailwind-variants'

export function cn<T extends CnOptions>(...classes: T) {
  return tvcn(...classes)({})
}
