import type { SourceCardData } from '@/queries'
import type { SourceInForm } from '@/schemas'
import { semanticListItems } from './strings'

export function sourcesToPlainText({
  sources,
  maxDisplay,
  prefix = 'Por',
}: {
  sources?:
    | (SourceCardData | typeof SourceInForm.Type)[]
    | Readonly<(SourceCardData | typeof SourceInForm.Type)[]>
    | null
    | undefined
  maxDisplay?: number
  prefix?: string
} = {}) {
  if (!sources || sources.length === 0) return ''

  const legibleSources = sources
    .map((source) => {
      if (source.type === 'GOROROBAS') {
        if ('users' in source) {
          return (source.users || []).map((u) => u.name).join(', ')
        }
        return undefined
      }
      if (source.origin) {
        return `${source.credits} (${URL.canParse(source.origin) ? `disponível em: ${source.origin}` : source.origin})`
      }
      return source.credits
    })
    .filter(Boolean) as string[]

  return `${prefix} ${semanticListItems(legibleSources, maxDisplay)}`
}
