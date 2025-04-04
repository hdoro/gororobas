'use client'

import { paths } from '@/utils/urls'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'

export default function LoginButton() {
  const currentPath = usePathname()

  return (
    <Button asChild mode="outline">
      <Link href={paths.signInOrSignUp(currentPath)}>Entrar</Link>
    </Button>
  )
}
