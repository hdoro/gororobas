'use client'

import type { VegetableCardData } from '@/queries'
import type { PropsWithChildren } from 'react'
import { useEffect, useRef, useState } from 'react'
import VegetableCard from './VegetableCard'

const SPEED = 0.15 // pixels per millisecond

function useHorizontalScrolling(initialDirection: 'ltr' | 'rtl' = 'ltr') {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const direction = useRef<'ltr' | 'rtl'>(initialDirection)

  // Initialize the scroll to the end for inverted strips
  useEffect(() => {
    const container = scrollContainerRef.current

    if (initialDirection === 'rtl' && container) {
      container.scrollLeft = container.scrollWidth - container.clientWidth
    }
  }, [initialDirection])

  // Auto-scrolling animation
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let animationId: number
    let lastTimestamp = 0

    const scroll = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp
      const elapsed = timestamp - lastTimestamp
      lastTimestamp = timestamp

      if (!isPaused && container) {
        const scrollDelta =
          SPEED * elapsed * (direction.current === 'ltr' ? 1 : -1)

        container.scrollBy({
          left: Number(scrollDelta.toFixed(1)),
          behavior: 'auto',
        })

        // Toggle scroll direction when reaching the end
        if (
          direction.current === 'ltr' &&
          container.scrollLeft + 10 >=
            container.scrollWidth - container.clientWidth
        ) {
          direction.current = 'rtl'
        } else if (
          direction.current === 'rtl' &&
          container.scrollLeft - 10 <= 0
        ) {
          direction.current = 'ltr'
        }
      }

      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isPaused])

  const onMouseEnter = () => {
    setIsPaused(true)
  }
  const onMouseLeave = () => {
    setIsPaused(false)
  }

  return {
    scrollContainerRef,
    handlers: {
      onMouseEnter,
      onMouseLeave,
    },
  }
}

export default function VegetablesStrip(
  props: PropsWithChildren<{
    vegetables: VegetableCardData[]
    inverted?: boolean
  }>,
) {
  const { scrollContainerRef, handlers } = useHorizontalScrolling(
    props.inverted ? 'rtl' : 'ltr',
  )

  return (
    <div className="flex justify-center overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="hide-scrollbar flex gap-9 overflow-x-auto"
        {...handlers}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {props.vegetables.map((vegetable) => (
          <VegetableCard
            key={vegetable.handle}
            vegetable={vegetable}
            fixedWidth
          />
        ))}
      </div>
    </div>
  )
}
