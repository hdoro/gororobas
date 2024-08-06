import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { auth } from '@/edgedb'
import { getAuthRedirect, paths } from '@/utils/urls'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Entrar no Gororobas',
}

export default async function ProfileRoute({
  searchParams,
}: {
  searchParams: { redirecionar?: string }
}) {
  const session = auth.getSession()

  if (await session.isSignedIn()) {
    return redirect(getAuthRedirect(true, paths.home()))
  }

  return (
    <main className="flex min-h-full items-center justify-center px-pageX py-16">
      <div className="max-w-md space-y-2">
        <Text level="h1" as="h1">
          Crie ou acesse uma
          <br />
          conta no Gororobas
        </Text>
        <Text level="p">
          Para continuar onde estava indo, você precisa de uma conta - lamento,
          mas só assim pra lembrarmos quem é!
        </Text>
        <div className="flex items-center gap-2 pt-2">
          <Button asChild>
            <a href={paths.signup(searchParams.redirecionar || paths.home())}>
              Criar conta
            </a>
          </Button>
          <Button asChild mode="outline">
            <a href={paths.signin(searchParams.redirecionar || paths.home())}>
              Entrar
            </a>
          </Button>
        </div>
      </div>
    </main>
  )
}
