'use server'

import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { Effect, pipe } from 'effect'
import { magicLinkSignIn, magicLinkSignUp } from './edgedbAuthActions'

export type SendMagicLinkState = {
  status: 'idle' | 'loading' | 'success' | 'error'
}

/** Single effect for sending both sign-up and sign-in magic links */
export async function sendMagicLink(
  prevState: SendMagicLinkState,
  formData: FormData,
): Promise<SendMagicLinkState> {
  return await runServerEffect(
    Effect.gen(function* () {
      if (prevState.status === 'success') return prevState

      const email = formData.get('email') as string

      yield* pipe(
        // First try signing up
        Effect.tryPromise(() => magicLinkSignUp({ email })),
        // If that fails, assuming user already exists, try signing in
        Effect.catchAll(() =>
          Effect.tryPromise(() => magicLinkSignIn({ email })),
        ),
      )

      return { status: 'success' } as const
    })
      .pipe(...buildTraceAndMetrics('auth.sendMagicLink'))
      .pipe(
        Effect.catchAll((error) => {
          console.error('[sendMagicLink] Failed to send magic link', error)
          return Effect.succeed({ status: 'error' } as const)
        }),
      ),
  )
}
