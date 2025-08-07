import type { CSSProperties } from 'react'
import useViewport from '@/hooks/useViewport'
import { cn } from '@/utils/cn'

/**
 * Hook that accounts for the mobile keyboard's height by using the visual viewport's height.
 * 💡 Position is a Tailwind class, so it can be overwritten with media classes.
 *
 * @example Used (at least) by RichText toolbars.
 */
export function useFixedBottomPosition(bottomOffset = 0) {
  const viewport = useViewport()

  return {
    className: cn(
      'fixed inset-x-0 z-50 bottom-[var(--bottom-offset)] origin-bottom-left translate-y-[var(--translate-y)]',
    ),
    styles: {
      '--bottom-offset': `${bottomOffset}px`,
      '--translate-y': `-${Math.round(
        viewport.window.height -
          (viewport.visualViewport?.height || 0) -
          viewport.visualViewport.offsetTop,
      )}px`,
    } satisfies CSSProperties,
  }
}
