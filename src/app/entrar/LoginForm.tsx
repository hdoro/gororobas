'use client'

import { type SendMagicLinkState, sendMagicLink } from '@/actions/sendMagicLink'
import GoogleMonogram from '@/components/icons/GoogleMonogram'
import NoteIcon from '@/components/icons/NoteIcon'
import QuoteIcon from '@/components/icons/QuoteIcon'
import SeedlingIcon from '@/components/icons/SeedlingIcon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { paths } from '@/utils/urls'
import { SendIcon } from 'lucide-react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

function MagicLinkForm({ state }: { state: SendMagicLinkState }) {
  const { pending } = useFormStatus()

  if (state.status === 'success') {
    return <div>Email enviado</div>
  }

  return (
    <>
      {state.status === 'error' && <div>Erro ao enviar email</div>}
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            disabled={pending}
          />
        </div>
        <Button type="submit" disabled={pending}>
          <SendIcon className="mr-1 w-[1.25em]" /> Enviar
        </Button>
      </div>
    </>
  )
}

export default function LoginForm({
  redirectTo,
}: {
  redirectTo?: string | undefined
}) {
  const [magicLinkState, formAction] = useActionState<SendMagicLinkState>(
    // @ts-expect-error Next or React is providing the wrong types, this action works correctly
    sendMagicLink,
    {
      status: 'idle',
    },
  )

  if (magicLinkState.status === 'success') {
    return (
      <main
        className="flex h-full items-center justify-center text-center"
        aria-live="polite"
      >
        <Card className="space-y-4 px-5 py-3">
          <CardHeader>
            <CardTitle>Email de login enviado ✨</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="flex items-center justify-center gap-3">
              Clique no link que enviamos para você entrar no Gororobas
            </Text>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="px-pageX py-pageY flex flex-col gap-8 lg:flex-row lg:gap-16 lg:py-20">
      <form action={formAction} className="-order-1 max-w-sm flex-1 space-y-1">
        <Text as="h1" level="h2" className="pb-4">
          Entrar ou criar conta
        </Text>
        <Button
          asChild
          tone="neutral"
          mode="outline"
          size="lg"
          className="flex"
        >
          <a href={paths.oauthLogin('builtin::oauth_google', redirectTo)}>
            <GoogleMonogram variant="color" className="w-[1.25em]" /> Entrar com
            Google
          </a>
        </Button>

        <div className="text-muted-foreground relative flex justify-center text-center">
          <div className="absolute inset-x-0 inset-y-1/2 h-[1px] bg-current opacity-30" />
          <Text
            level="sm"
            className="bg-background relative z-10 inline-block p-3"
          >
            ou via email
          </Text>
        </div>

        <MagicLinkForm state={magicLinkState} />
      </form>
      <Card className="max-w-md">
        <CardHeader className="md:py-4">
          <CardTitle className="text-base md:text-lg">
            Por que criar um perfil?
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 md:pb-8">
          <ul className="space-y-8">
            <li className="flex items-start gap-2">
              <SeedlingIcon
                variant="color"
                className="mr-1 w-[2.25em] flex-[0_0_2.25em]"
              />
              <Text className="-mt-1" as="div">
                Salve vegetais que quer plantar, já plantou ou está cultivando
              </Text>
            </li>
            <li className="flex items-start gap-2">
              <NoteIcon
                variant="color"
                className="mr-1 w-[2.25em] flex-[0_0_2.25em]"
              />
              <Text className="-mt-1" as="div">
                Escreva e compartilhe notinhas sobre seus aprendizados na
                cozinha e na terra
              </Text>
            </li>
            <li className="flex items-start gap-2">
              <QuoteIcon
                variant="color"
                className="mr-1 w-[2.25em] flex-[0_0_2.25em]"
              />
              <Text className="-mt-1" as="div">
                Contribua com melhores informações sobre vegetais e envie suas
                dicas e recomendações
              </Text>
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
