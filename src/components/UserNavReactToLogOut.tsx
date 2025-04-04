'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

/** Hacky way of ensuring UserNav is revalidated. `revalidatePath` wasn't working in `/auth/[...auth]` */
export default function UserNavReactToLogOut() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    if (searchParams.get('sair') && pathname === '/') {
      window.location.replace(pathname)
    }
  }, [searchParams, pathname])

  return null
}
