'use client'

import { useEffect } from 'react'

export default function HideFooter() {
  useEffect(() => {
    const footer = document.getElementById('global-footer')
    footer?.classList.add('hidden')

    return () => {
      footer?.classList.remove('hidden')
    }
  }, [])

  return null
}
