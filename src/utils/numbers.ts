export const MAX_ACCEPTED_HEIGHT = 30_000 // 300m

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
    }).format(days / 365)
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

export function formatNumber(value: number, format: NumberFormat) {
  if (typeof value !== 'number' || Number.isNaN(value) || format === 'none')
    return String(value)

  if (format === 'centimeters')
    return `${value} cm ${value >= 100 ? `(${formatCentimeters(value)})` : ''}`

  if (format === 'temperature') return `${value} ºC`

  if (format === 'days')
    return `${value} dia${value > 1 ? 's' : ''} ${
      value >= 365 ? `(${formatDays(value)})` : ''
    }`

  return String(value)
}
