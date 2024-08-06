import type { VegetablePageData } from '@/queries'
import { cn } from '@/utils/cn'
import React from 'react'
import { Badge } from './ui/badge'

export default function PhotoLabelAndSources({
  photo,
  className,
}: {
  photo?: VegetablePageData['photos'][number]
  className?: string
}) {
  if (!photo) return null

  return (
    <Badge
      className={cn(
        'absolute bottom-2 left-2 max-w-[80%] flex-col !items-start',
        className,
      )}
      variant="outline"
    >
      {photo.label && (
        <div className="max-w-full overflow-hidden text-ellipsis">
          {photo.label}
        </div>
      )}
      {photo.sources && photo.sources.length > 0 && (
        <div className="max-w-full overflow-hidden text-ellipsis text-xs font-normal text-muted-foreground">
          Por{' '}
          {(photo.sources || []).map((source) => {
            if (source.type === 'GOROROBAS') {
              return (
                <React.Fragment key={source.id}>
                  {(source.users || []).map((u) => u.name).join(', ')}
                </React.Fragment>
              )
            }
            if (source.origin && URL.canParse(source.origin)) {
              return (
                <a
                  key={source.id}
                  href={source.origin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  {source.credits}
                </a>
              )
            }
            return (
              <React.Fragment key={source.id}>{source.credits}</React.Fragment>
            )
          })}
        </div>
      )}
    </Badge>
  )
}
