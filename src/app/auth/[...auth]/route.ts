import { auth } from '@/gel'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { EmailNotVerifiedError, SigninFailedError } from '@/types/errors'
import { paths } from '@/utils/urls'
import { Effect } from 'effect'
import { RedirectType, redirect } from 'next/navigation'
import {
  clearAuthRedirectCookie,
  getAuthRedirectCookie,
  setAuthRedirectCookie,
} from './authRedirects'
import createUserProfile from './createUserProfile'
import getGoogleMetadata from './getGoogleMetadata'

const gelAuthHandlers = auth.createAuthRouteHandlers({
  async onOAuthCallback(props) {
    const response = await runServerEffect(
      Effect.gen(function* (_) {
        yield* Effect.logInfo('onOAuthCallback', props)
        if (props.error) {
          yield* Effect.logError('[onOAuthCallback] error:', props.error)
          return yield* Effect.fail(new SigninFailedError(props.error))
        }

        if (!props.tokenData) {
          return yield* Effect.fail(new EmailNotVerifiedError())
        }

        if (props.isSignUp) {
          let oauthMetadata: {
            name: string | null
            email: string | null
          } | null = null

          if (
            props.provider === 'builtin::oauth_google' &&
            props.tokenData.provider_token
          ) {
            oauthMetadata = yield* getGoogleMetadata(props.tokenData).pipe(
              Effect.tap((name) =>
                Effect.logInfo('[getGoogleName] name:', name),
              ),
              Effect.tapError((error) =>
                Effect.logError('[getGoogleName] error:', error),
              ),
              // If it fails, it's not a critical error - we'll assign a random name to the user
              Effect.catchAll(() => Effect.succeed(null)),
            )
          }

          return yield* createUserProfile(false, oauthMetadata).pipe(
            Effect.map(
              () =>
                ({
                  success: true,
                  redirect: paths.editProfile(),
                }) as const,
            ),
          )
        }

        const redirectTo = yield* Effect.promise(getAuthRedirectCookie)
        yield* Effect.promise(clearAuthRedirectCookie)

        return { success: true, redirect: redirectTo } as const
      })
        .pipe(...buildTraceAndMetrics('auth.onOAuthCallback'))
        .pipe(
          Effect.catchAll(() => Effect.succeed({ success: false } as const)),
        ),
    )

    if (response.success) {
      redirect(response.redirect)
    } else {
      redirect(`${paths.signInOrSignUp()}?error=oauth`)
    }
  },
  async onMagicLinkCallback(props) {
    const response = await runServerEffect(
      Effect.gen(function* (_) {
        yield* Effect.logInfo('onMagicLinkCallback', props)
        if (props.error) {
          yield* Effect.logError('[onMagicLinkCallback] error:', props.error)
          return yield* Effect.fail(new SigninFailedError(props.error))
        }

        if (!props.tokenData) {
          return yield* Effect.fail(new EmailNotVerifiedError())
        }

        if (props.isSignUp) {
          return yield* createUserProfile().pipe(
            Effect.map(
              () =>
                ({
                  success: true,
                  redirect: paths.editProfile(),
                }) as const,
            ),
          )
        }

        const redirectTo = yield* Effect.promise(getAuthRedirectCookie)
        yield* Effect.promise(clearAuthRedirectCookie)

        return { success: true, redirect: redirectTo } as const
      })
        .pipe(...buildTraceAndMetrics('auth.onMagicLinkCallback'))
        .pipe(
          Effect.catchAll(() => Effect.succeed({ success: false } as const)),
        ),
    )

    if (response.success) {
      redirect(response.redirect)
    } else {
      redirect(`${paths.signInOrSignUp()}?error=magic-link`)
    }
  },
  async onSignout() {
    // @TODO remove once @gel/auth-nextjs fixes sign-out not working on Next dev
    await auth.deleteAuthCookie()
    // Hacky way of ensuring UserNav is revalidated. `revalidatePath` wasn't working
    redirect(`${paths.home()}?sair=true`, RedirectType.replace)
  },
})

export const POST = gelAuthHandlers.POST

/** Superset of @gel/auth-nextjs handler to ensure redirect mechanism works */
export const GET: typeof gelAuthHandlers.GET = async (...props) => {
  const url = new URL(props[0].url)
  await setAuthRedirectCookie(url.searchParams.get('redirecionar'))

  return await gelAuthHandlers.GET(...props)
}
