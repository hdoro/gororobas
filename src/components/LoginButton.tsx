'use client'

import { m } from '@/paraglide/messages'
import { paths } from '@/utils/urls'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'

export default function LoginButton() {
  const currentPath = usePathname()

  return (
    <Button asChild mode="outline">
      <Link href={paths.signInOrSignUp(currentPath)} rel="noindex nofollow">
        {m.cuddly_misty_gopher_type()}
      </Link>
    </Button>
  )
}
