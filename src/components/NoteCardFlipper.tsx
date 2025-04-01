'use client'

import { cn } from '@/utils/cn'
import type { ElementTransform } from '@/utils/noteCardTransforms'
import { type PropsWithChildren, useState } from 'react'

/** Wrapper component for NoteCard to prevent having to ship it as a client component.
 * Sole responsibility is toggling the `data-flipped` state for CSS changes to have an effect.
 */
export default function NoteCardFlipper(
  props: PropsWithChildren<{
    hasBody: boolean
    handle: string
    transform: ElementTransform
    variant?: 'grid' | 'page'
  }>,
) {
  const [flipped, setFlipped] = useState(false)

  const RootElement = props.hasBody ? 'button' : 'div'
  return (
    <RootElement
      id={`nota-${props.handle}`}
      className={cn(
        'note-card--root group @container relative aspect-[1.15] h-auto text-left',
        props.variant === 'page'
          ? 'w-[var(--card-width)] flex-[0_0_var(--card-width)]'
          : 'max-w-[var(--card-width)] min-w-[calc(var(--card-width)_*_0.75)] flex-1',
      )}
      type={props.hasBody ? 'button' : undefined}
      onClick={
        props.hasBody
          ? (e) => {
              // if clicking on a link inside the note, don't flip the card
              if (
                e.target instanceof HTMLAnchorElement ||
                (e.target instanceof HTMLSpanElement &&
                  e.target.parentElement instanceof HTMLAnchorElement)
              ) {
                return
              }
              setFlipped(!flipped)
            }
          : undefined
      }
      style={{
        perspective: '600px',
        transform: `rotate(${props.transform.rotate}deg) translate(${props.transform.x}px, ${props.transform.y}px)`,
        '--card-width':
          props.variant === 'page'
            ? // Double the size in dedicated pages, but don't let overflow beyond the viewport (min)
              'min(100%, calc(var(--note-card-width) * 1.5))'
            : 'var(--note-card-width)',
      }}
      data-flipped={flipped}
    >
      {props.children}
    </RootElement>
  )
}
