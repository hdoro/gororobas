import { debounce } from '@/utils/debounce'
import { useEffect, useState } from 'react'

const getViewports = () => {
  if (typeof window === 'undefined' || !window)
    return {
      window: {
        height: 1,
        width: 1,
      },
      viewport: {
        width: 1,
        height: 1,
      },
      visualViewport: {
        width: 1,
        height: 1,
        offsetTop: 1,
        offsetLeft: 1,
      },
    }

  return {
    window: {
      height: window.innerHeight,
      width: window.innerWidth,
    },
    viewport: {
      width: Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0,
      ),
      height: Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0,
      ),
    },
    visualViewport: {
      width: window.visualViewport?.width,
      height: window.visualViewport?.height,
      offsetTop: window.visualViewport?.offsetTop || 0,
      offsetLeft: window.visualViewport?.offsetLeft || 0,
    },
  }
}

export default function useViewport() {
  const [state, setState] = useState(getViewports)

  useEffect(() => {
    const updateViewports = () => setState(getViewports)

    // visualViewport events naturally happen at a lower rate, no need to debounce
    // https://developer.chrome.com/blog/visual-viewport-api#the_event_rate_is_slow
    window.visualViewport?.addEventListener('resize', updateViewports)
    window.visualViewport?.addEventListener('scroll', updateViewports)

    // We need a listener on the window's scroll, see:
    // https://developer.chrome.com/blog/visual-viewport-api#events_only_fire_when_the_visual_viewport_changes
    const debouncedUpdate = debounce(updateViewports, 32)
    window.addEventListener('scroll', debouncedUpdate)

    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewports)
      window.visualViewport?.removeEventListener('scroll', updateViewports)
      window.removeEventListener('scroll', debouncedUpdate)
    }
  }, [])

  return state
}
