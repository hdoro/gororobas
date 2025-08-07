'use client'

import { SendIcon } from 'lucide-react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
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
import { m } from '@/paraglide/messages'
import { paths } from '@/utils/urls'

function MagicLinkForm({
  state,
  redirectTo,
}: {
  state: SendMagicLinkState
  redirectTo?: string | undefined
}) {
  const { pending } = useFormStatus()

  if (state.status === 'success') {
    return <div>{m.neat_salty_frog_scold()}</div>
  }

  return (
    <>
      <input
        hidden
        id="redirect-to"
        name="redirect-to"
        type="text"
        value={redirectTo || '/'}
        readOnly
      />
      {state.status === 'error' && <div>{m.drab_away_starfish_gleam()}</div>}
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="email">{m.nice_crisp_wombat_quiz()}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            disabled={pending}
          />
        </div>
        <Button type="submit" disabled={pending}>
          <SendIcon className="mr-1 w-[1.25em]" />{' '}
          {m.stock_crisp_buzzard_feel()}
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
            <CardTitle>{m.neat_salty_frog_scold()}</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="flex items-center justify-center gap-3">
              {m.stout_bland_panther_renew()}
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
          {m.weak_watery_leopard_love()}
        </Text>
        <Button
          asChild
          tone="neutral"
          mode="outline"
          size="lg"
          className="flex"
        >
          <a href={paths.oauthLogin('builtin::oauth_google', redirectTo)}>
            <GoogleMonogram variant="color" className="w-[1.25em]" />{' '}
            {m.major_weird_snake_believe()}
          </a>
        </Button>

        <div className="text-muted-foreground relative flex justify-center text-center">
          <div className="absolute inset-x-0 inset-y-1/2 h-[1px] bg-current opacity-30" />
          <Text
            level="sm"
            className="bg-background relative z-10 inline-block p-3"
          >
            {m.orange_deft_eagle_dine()}
          </Text>
        </div>

        <MagicLinkForm state={magicLinkState} redirectTo={redirectTo} />
      </form>
      <Card className="max-w-md">
        <CardHeader className="md:py-4">
          <CardTitle className="text-base md:text-lg">
            {m.solid_deft_worm_endure()}
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
                {m.round_ornate_bison_pick()}
              </Text>
            </li>
            <li className="flex items-start gap-2">
              <NoteIcon
                variant="color"
                className="mr-1 w-[2.25em] flex-[0_0_2.25em]"
              />
              <Text className="-mt-1" as="div">
                {m.helpful_giant_wombat_taste()}
              </Text>
            </li>
            <li className="flex items-start gap-2">
              <QuoteIcon
                variant="color"
                className="mr-1 w-[2.25em] flex-[0_0_2.25em]"
              />
              <Text className="-mt-1" as="div">
                {m.zippy_every_anaconda_believe()}
              </Text>
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
