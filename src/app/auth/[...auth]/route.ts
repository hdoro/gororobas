import { auth } from '@/edgedb'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { EmailNotVerifiedError, SigninFailedError } from '@/types/errors'
import { paths } from '@/utils/urls'
import { Effect } from 'effect'
import { RedirectType, redirect } from 'next/navigation'
import createUserProfile from './createUserProfile'

export const { GET, POST } = auth.createAuthRouteHandlers({
	async onBuiltinUICallback({ error, tokenData, isSignUp }) {
		const response = await runServerEffect(
			Effect.gen(function* (_) {
				if (error) {
					console.error('[onBuiltinUICallback] error:', error)
					return yield* Effect.fail(new SigninFailedError(error))
				}

				if (!tokenData) {
					return yield* Effect.fail(new EmailNotVerifiedError())
				}

				if (isSignUp) {
					return yield* createUserProfile().pipe(
						Effect.map(
							() => ({ success: true, redirect: paths.editProfile() }) as const,
						),
					)
				}

				return { success: true, redirect: paths.editProfile() } as const
			})
				.pipe(...buildTraceAndMetrics('auth.builtinUICallback'))
				.pipe(
					Effect.catchAll(() => Effect.succeed({ success: false } as const)),
				),
		)

		if (response.success) {
			redirect(response.redirect)
		}

		// If it failed, return to homepage
		// @TODO: better error handling
		redirect(paths.home())
	},
	onSignout() {
		redirect(paths.home(), RedirectType.replace)
	},
})
