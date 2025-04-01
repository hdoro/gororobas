export interface ElementTransform {
  rotate: number
  x: number
  y: number
}

/**
 * Generate deterministic values within each range.
 *
 * The modulo operation (%) limits the seed to a small range of values:
 * - seed % 7 gives values 0-6
 * - seed % 11 gives values 0-10
 * - seed % 13 gives values 0-12
 *
 * We then divide by these numbers (6, 10, 12) to normalize the result to a value between 0-1
 * For example: (seed % 7) / 6 gives us a value between 0 and 1
 *
 * Finally, we scale this 0-1 value to our desired range by multiplying by the range width
 * and adding the minimum value
 */
function generateRandomNumberFromSeed({
  seed,
  range,
  primeFactor,
}: {
  seed: number
  range: [min: number, max: number]
  primeFactor: 7 | 11 | 13
}) {
  return (
    range[0] +
    ((seed % primeFactor) / (primeFactor - 1)) * (range[1] - range[0])
  )
}

/** Create a deterministic seed from a string */
function seedFromString(str: string) {
  return str
    .split('')
    .reduce((acc, char, index) => acc + char.charCodeAt(0) + index, 0)
}

/**
 * Creates a deterministic transform for a note card based on its handle
 * Similar to getRandomTransform but uses the handle to generate consistent values
 */
export function getNoteCardTransform(handle: string): ElementTransform {
  const seed = seedFromString(handle)

  return {
    rotate: generateRandomNumberFromSeed({
      seed,
      range: [-3, 3],
      primeFactor: 7,
    }),
    x: generateRandomNumberFromSeed({
      seed,
      range: [-7.5, 7.5],
      primeFactor: 11,
    }),
    y: generateRandomNumberFromSeed({
      seed,
      range: [-7.5, 7.5],
      primeFactor: 13,
    }),
  }
}
