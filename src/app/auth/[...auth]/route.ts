import { auth } from '@/gel'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { EmailNotVerifiedError, SigninFailedError } from '@/types/errors'
import { paths } from '@/utils/urls'
import { Effect } from 'effect'
import { RedirectType, redirect } from 'next/navigation'
import createUserProfile from './createUserProfile'
import getGoogleName from './getGoogleName'

export const { GET, POST } = auth.createAuthRouteHandlers({
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
          let name: null | string = null

          if (
            props.provider === 'builtin::oauth_google' &&
            props.tokenData.provider_token
          ) {
            name = yield* getGoogleName(props.tokenData).pipe(
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

          return yield* createUserProfile(false, name).pipe(
            Effect.map(
              () =>
                ({
                  success: true,
                  redirect: paths.editProfile(),
                }) as const,
            ),
          )
        }

        // Users that had already signed up are taken to the home page
        return { success: true, redirect: paths.home() } as const
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

        // Users that had already signed up are taken to the home page
        return { success: true, redirect: paths.home() } as const
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
  onSignout() {
    redirect(paths.home(), RedirectType.replace)
  },
})
