import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { paths } from '@/utils/urls'
import type { Metadata } from 'next'
import Image from 'next/image'
import bgImage from '../404-bg.png'

export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: 'noindex nofollow',
}

export default async function NotFoundRoute() {
  return (
    <main className="relative mt-4 flex min-h-full items-center justify-center overflow-hidden px-pageX">
      <div className="z-10 max-w-md space-y-2 text-center">
        <Text level="h1" as="h1">
          Página não
          <br />
          encontrada
        </Text>
        <Button asChild>
          <a href={paths.home()}>Voltar à página inicial</a>
        </Button>
      </div>
      <Image
        alt="Ilustração de vegetais flutuando no espaço"
        src={bgImage}
        fill
        className="absolute inset-0 block object-cover"
      />
    </main>
  )
}
