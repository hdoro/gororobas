import type { RangeFormValue } from '@/schemas'

/** In centimeters - 100m */
export const MAX_ACCEPTED_HEIGHT = 100_01

export function formatCentimeters(cm: number) {
  /** If over 1 meter, return in meters */
  if (cm >= 100) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'unit',
      unit: 'meter',
      unitDisplay: 'narrow',
    }).format(cm / 100)
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'unit',
    unit: 'centimeter',
    unitDisplay: 'narrow',
  }).format(cm)
}

export function formatDays(days: number) {
  if (days >= 365) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'unit',
      unit: 'year',
      unitDisplay: 'narrow',
      maximumFractionDigits: 1,
    }).format(days / 365)
  }

  if (days >= 60) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'unit',
      unit: 'month',
      unitDisplay: 'narrow',
      maximumFractionDigits: 1,
    }).format(days / 30)
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'unit',
    unit: 'day',
    unitDisplay: 'narrow',
  }).format(days)
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function average(numbers: number[]) {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export type NumberFormat = 'none' | 'centimeters' | 'temperature' | 'days'

export function formatNumber(
  value: number,
  format: NumberFormat,
  /** When inputting data, it's important for users to know the exact number.
   * However, for displaying it's usually better to only show the more readable unit (e.g. 1.8 years instead of 658 days)
   */
  precision: 'full' | 'approximate' = 'full',
) {
  if (typeof value !== 'number' || Number.isNaN(value) || format === 'none')
    return String(value)

  if (format === 'centimeters') {
    if (precision === 'approximate') return formatCentimeters(value)

    return `${value} cm ${value >= 100 ? `(${formatCentimeters(value)})` : ''}`
  }

  if (format === 'temperature') return `${value} ºC`

  if (format === 'days') {
    if (precision === 'approximate') return formatDays(value)

    return `${value} dia${value > 1 ? 's' : ''} ${
      value >= 365 ? `(${formatDays(value)})` : ''
    }`
  }

  return String(value)
}

export function rangeValueToLabel(
  value: typeof RangeFormValue.Type | null | undefined,
  format: NumberFormat,
) {
  if (!value) return '\u200B'

  const [min, max] = value
  if (!min && !max) return '\u200B'

  let parts: (string | number)[] = []
  if (!min) {
    parts = ['até ', max as number]
  } else if (!max) {
    parts = ['a partir de ', min]
  } else {
    parts = ['de ', min, ' a ', max]
  }

  return parts
    .map((value) => {
      if (typeof value === 'string' || format === 'none') return value

      return formatNumber(value, format, 'approximate')
    })
    .join('')
}
