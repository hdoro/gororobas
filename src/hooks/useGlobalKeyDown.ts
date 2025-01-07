import { useEffect } from 'react'

export default function useGlobalKeyDown(
  handler: (event: KeyboardEvent) => void,
  dependencies: unknown[] = [],
) {
  useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [handler, ...dependencies])
}
