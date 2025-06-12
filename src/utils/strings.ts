import type { Gender } from '@/gel.interfaces'
import { m } from '@/paraglide/messages'
import { getLocale } from '@/paraglide/runtime'

/**
 * Limits a string to a certain length for UI or SEO purposes.
 *
 * Dive further: https://hdoro.dev/javascript-truncation
 */
export function truncate(str: string, maxLength: number) {
  if (str.length < maxLength) {
    return str
  }

  if (maxLength < 0) return ''

  // To prevent truncating in the middle of words, let's get
  // the position of the first whitespace after the truncation
  const firstWhitespaceAfterTruncation =
    str.slice(maxLength).search(/\s/) + maxLength

  return `${str.slice(0, firstWhitespaceAfterTruncation)}...`
}

export function capitalize(str: string, allWords = true): string {
  if (typeof str !== 'string' || !str[0]) {
    return str
  }

  if (allWords) {
    return str
      .split(' ')
      .map((word) => capitalize(word, false))
      .join(' ')
  }

  return `${str[0].toUpperCase()}${str.slice(1) || ''}`
}

/**
 * Makes a string URL-friendly.
 * Removes special characters, spaces, upper-cased letters.
 */
export function slugify(str: string) {
  return (
    str
      .toString()
      .normalize('NFD') // split an accented letter in the base letter and the acent
      // Replace unicode characters, such as accents
      // biome-ignore lint:
      .replace(/[\u0300-\u036f\u0023]/g, '') // remove all previously split accents
      .toLowerCase()
      // Replace any character that isn't accepted
      .replace(/[^a-z0-9 -]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/-$/g, '')
      .replace(/^-/g, '')
      .trim()
  )
}

export function semanticListItems(
  input_items: string[],
  maxDisplay?: number,
  options?: Intl.ListFormatOptions,
) {
  if (!input_items || !input_items.length) return ''

  const formatter = new Intl.ListFormat(getLocale(), {
    style: 'long',
    type: 'conjunction',
    ...(options || {}),
  })

  const items = input_items.map((item) => item.trim())
  if (maxDisplay && items.length > maxDisplay) {
    return formatter.format([
      ...items.slice(0, maxDisplay),

      m.even_legal_tortoise_dash({
        remaining: items.length - maxDisplay,
        is_conjunction: String(
          formatter.resolvedOptions().type === 'conjunction',
        ),
      }),
    ])
  }
  return formatter.format(items)
}

export function concatStringArray(arr: string[]) {
  return arr.reduce((acc, val) => `${acc} ${val}`, '').trim()
}

const GENDER_ARTICLES: Record<Gender, string> = {
  FEMININO: 'a',
  MASCULINO: 'o',
  NEUTRO: '',
}

const GENDER_PRONOUM: Record<Gender, string> = {
  FEMININO: 'ela',
  MASCULINO: 'ele',
  NEUTRO: '',
}

const GENDER_PREPOSITIONS: Record<Gender, string> = {
  FEMININO: 'da',
  MASCULINO: 'do',
  NEUTRO: 'de',
}

const GENDER_SUFFIX: Record<Gender, string> = {
  FEMININO: 'a',
  MASCULINO: 'o',
  NEUTRO: 'e',
}

type StrPad = 'both' | 'start' | 'end' | 'none'

function padString(str: string, pad: StrPad = 'none') {
  if (pad === 'both') return ` ${str} `
  if (pad === 'start') return ` ${str}`
  if (pad === 'end') return `${str} `

  return str
}

export const gender = {
  article: (gender: Gender = 'NEUTRO', pad: StrPad = 'none') => {
    const article = GENDER_ARTICLES[gender]
    if (!article || article === '') return ''

    return padString(article, pad)
  },
  pronoun: (gender: Gender = 'NEUTRO', pad: StrPad = 'none') => {
    const pronoun = GENDER_PRONOUM[gender]
    if (!pronoun || pronoun === '') return ''

    return padString(pronoun, pad)
  },
  preposition: (gender: Gender = 'NEUTRO', pad: StrPad = 'none') => {
    const preposition = GENDER_PREPOSITIONS[gender]
    if (!preposition || preposition === '') return ''

    return padString(preposition, pad)
  },
  suffix: (gender: Gender = 'NEUTRO') => {
    return GENDER_SUFFIX[gender]
  },
}

export function stringToHashtag(str: string) {
  return `#${capitalize(str, true).replace(/\s/g, '')}`
}
