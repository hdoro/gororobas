import { render } from '@react-email/components'
import { Config, Effect } from 'effect'
import type { CreateEmailOptions } from 'resend'
import * as Mailpit from '../services/mailpit'
import * as Resend from '../services/resend'

const FROM_NAME = 'Gororobas Agroecologia'
const FROM_EMAIL = 'ola@gororobas.com'

export const sendEmail = (
  payload: Omit<CreateEmailOptions, 'from'> & { react: React.ReactNode },
) =>
  Effect.gen(function* () {
    const nodeEnv = yield* Config.string('NODE_ENV')
    const isDev = nodeEnv === 'development'

    if (isDev) {
      const mailpit = yield* Mailpit.Mailpit
      const html = yield* Effect.tryPromise({
        // biome-ignore lint: We do indeed need this fragment
        try: () => render(<>{payload.react}</>),
        catch: () =>
          new Mailpit.MailpitError({
            message: 'Failed to render React Email',
          }),
      })
      const result = yield* mailpit.use((client) =>
        client.sendMessage({
          From: { Email: FROM_EMAIL, Name: FROM_NAME },
          To: [payload.to].flat().map((email) => ({ Email: email })),
          HTML: html,
          Bcc: payload.bcc ? [payload.bcc].flat() : [],
          Cc: payload.cc
            ? [payload.cc].flat().map((email) => ({ Email: email }))
            : [],
          Attachments: payload.attachments
            ? [payload.attachments].flat().map((attachment) => ({
                Content: attachment.content?.toString('base64') ?? '',
                ContentType: attachment.contentType ?? '',
                Filename: attachment.filename || '',
              }))
            : [],
          Subject: payload.subject || '',
        }),
      )
      return { id: result.ID }
    }

    const resend = yield* Resend.Resend
    const result = yield* resend.use((client) =>
      client.emails.send({
        ...payload,
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
      }),
    )
    if (!result.data?.id) {
      return yield* Effect.fail(
        new Resend.ResendError({
          message: 'Failed to send email',
        }),
      )
    }
    return {
      id: result.data.id,
    }
  })
