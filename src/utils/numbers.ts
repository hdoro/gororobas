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

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function average(numbers: number[]) {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length
}
