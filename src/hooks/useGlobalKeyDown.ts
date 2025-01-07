import { useEffect } from 'react'

export default function useGlobalKeyDown(
  handler: (event: KeyboardEvent) => void,
  dependencies: unknown[] = [],
  options?: AddEventListenerOptions,
) {
  useEffect(() => {
    window.addEventListener('keydown', handler, options)
    return () => {
      window.removeEventListener('keydown', handler, options)
    }
  }, [handler, options, ...dependencies])
}
