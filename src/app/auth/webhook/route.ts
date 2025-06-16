import crypto from 'node:crypto'
import MagicLinkEmail from '@/emails/magic-link'
import { getUserEmail } from '@/queries'
import { Gel, Mailpit, Resend } from '@/services'
import { runServerEffect } from '@/services/runtime'
import { configureRequestLocale } from '@/utils/i18n.server'
import * as Email from '@/utils/sendEmail'
import { paths } from '@/utils/urls'
import { Config, Data, Effect, Layer, LogLevel, Logger, Schema } from 'effect'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const AllServices = Layer.mergeAll(Resend.fromEnv, Mailpit.fromEnv, Gel.layer)

const MagicLinkRequested = Schema.Struct({
  event_type: Schema.Literal('MagicLinkRequested'),
  email_factor_id: Schema.String,
  identity_id: Schema.String,
  event_id: Schema.String,
  timestamp: Schema.Date,
  magic_link_token: Schema.String,
  magic_link_url: Schema.URL,
})

const IdentityCreated = Schema.Struct({
  event_type: Schema.Literal('IdentityCreated'),
  identity_id: Schema.String,
  event_id: Schema.String,
  timestamp: Schema.Date,
})

const IdentityAuthenticated = Schema.Struct({
  event_type: Schema.Literal('IdentityAuthenticated'),
})

const EmailFactorCreated = Schema.Struct({
  event_type: Schema.Literal('EmailFactorCreated'),
  email_factor_id: Schema.String,
  identity_id: Schema.String,
  event_id: Schema.String,
  timestamp: Schema.Date,
})

/** Currently only handling `MagicLinkRequested` */
const Payload = Schema.Union(
  MagicLinkRequested,
  IdentityCreated,
  IdentityAuthenticated,
  EmailFactorCreated,
)

export class AuthWebhookError extends Data.TaggedError('AuthWebhookError')<{
  cause?: unknown
  message?: string
  status?: number
}> {}

const validateRequest = (request: NextRequest) =>
  Effect.gen(function* () {
    const bodyText = yield* Effect.tryPromise({
      try: () => request.clone().text(),
      catch: (error) =>
        Effect.fail(
          new AuthWebhookError({
            message: 'Error reading request body',
            cause: error,
          }),
        ),
    })

    if (!bodyText) {
      return yield* Effect.fail(
        new AuthWebhookError({
          message: 'Invalid request body',
          status: 400,
        }),
      )
    }

    const signatureKey = request.headers.get('x-ext-auth-signature-sha256')

    if (!signatureKey) {
      return yield* Effect.fail(
        new AuthWebhookError({
          message: 'Missing signature header',
          status: 400,
        }),
      )
    }

    const secret = yield* Config.string('AUTH_WEBHOOK_SECRET')

    if (!secret) {
      return yield* Effect.fail(
        new AuthWebhookError({
          message: 'Webhook secret not configured.',
          status: 500,
        }),
      )
    }

    const hmac = crypto.createHmac('sha256', secret)
    const computedSignature = hmac.update(bodyText).digest('hex')

    if (computedSignature !== signatureKey) {
      return yield* Effect.fail(
        new AuthWebhookError({
          message: 'Invalid signature',
          status: 401,
        }),
      )
    }

    const trusted = Buffer.from(computedSignature, 'hex')
    const untrusted = Buffer.from(signatureKey, 'hex')
    if (
      // Ensure buffers have the same length to prevent timingSafeEqual from throwing
      trusted.length !== untrusted.length ||
      // Use crypto.timingSafeEqual for security
      !crypto.timingSafeEqual(trusted, untrusted)
    ) {
      return yield* Effect.fail(
        new AuthWebhookError({
          message: 'Invalid signature',
          status: 401,
        }),
      )
    }

    yield* Effect.logDebug('[AuthWebhook] raw request', JSON.parse(bodyText))
    return yield* Schema.decode(Schema.parseJson(Payload))(bodyText)
  })

/** Based on the user's email factor ID, get their email and send the magic link */
const sendMagicLink = (event: typeof MagicLinkRequested.Type) =>
  Effect.gen(function* () {
    const gel = yield* Gel.Gel
    const emailFactor = yield* gel.use((client) =>
      getUserEmail.run(client.withConfig({ apply_access_policies: false }), {
        email_factor_id: event.email_factor_id,
      }),
    )

    yield* Effect.logDebug(
      '[AuthWebhook/sendMagicLink] emailFactor',
      emailFactor,
    )
    if (!emailFactor?.email) {
      return yield* Effect.fail(
        new AuthWebhookError({
          message: 'Email factor not found',
          status: 404,
        }),
      )
    }

    event.magic_link_url.searchParams.set('token', event.magic_link_token)
    event.magic_link_url.searchParams.set(
      'redirect_on_failure',
      encodeURIComponent(`${paths.signInOrSignUp()}?error=magic-link`),
    )
    yield* Email.sendEmail({
      to: emailFactor.email,
      subject: 'Entrar no Gororobas',
      react: MagicLinkEmail({
        magic_link_url: event.magic_link_url.toString(),
      }),
    })
    yield* Effect.logDebug('[AuthWebhook/sendMagicLink] link sent')
  })

export function POST(request: NextRequest) {
  return runServerEffect(
    Effect.gen(function* () {
      // Configure the locale so we can localize the redirect below
      yield* Effect.tryPromise({
        try: () => configureRequestLocale(),
        catch: () => Effect.succeed(null),
      })

      const event = yield* validateRequest(request)
      yield* Effect.logDebug(`\n[AuthWebhook] ${event.event_type}`, event)

      if (event.event_type === 'MagicLinkRequested') {
        yield* sendMagicLink(event)
      }

      return NextResponse.json({ received: true }, { status: 200 })
    }).pipe(
      Effect.catchTag('AuthWebhookError', (error) =>
        Effect.succeed(NextResponse.json({}, { status: error.status || 500 })),
      ),
      Effect.catchAll(() =>
        Effect.succeed(NextResponse.json({}, { status: 500 })),
      ),
      Effect.provide(AllServices),
      Logger.withMinimumLogLevel(LogLevel.Debug),
    ),
  )
}
