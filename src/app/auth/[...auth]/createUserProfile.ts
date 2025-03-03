import { auth } from '@/gel'
import { buildTraceAndMetrics } from '@/services/runtime'
import { UnknownGelDBError } from '@/types/errors'
import { generateId } from '@/utils/ids'
import { getStandardHandle } from '@/utils/urls'
import { Effect } from 'effect'

export default function createUserProfile(
  /** Keep track of retries to gauge how many auth callbacks are failing */
  isRetry = false,
  oauthName: string | null = null,
) {
  return Effect.gen(function* (_) {
    const session = yield* _(Effect.tryPromise(() => auth.getSession()))
    const userClient = session.client.withConfig({
      allow_user_specified_id: true,
      // Skip access policies as users can't create `User` objects until they have their `UserProfile`
      apply_access_policies: false,
    })

    const factorData = yield* _(
      Effect.tryPromise({
        try: () =>
          userClient.querySingle<{ email?: string }>(`
      SELECT ext::auth::Factor {
        [is ext::auth::MagicLinkFactor].email
      } FILTER .identity = (global ext::auth::ClientTokenIdentity)
    `),
        catch: () => {
          console.error('[createUserProfile] Failed fetching user factor')
          return Effect.succeed(null)
        },
      }),
    )

    const userId = generateId()
    const initialName = oauthName || factorData?.email?.split('@')[0] || ''
    const initialHandle = getStandardHandle(initialName || '', userId)

    return yield* Effect.tryPromise({
      try: () =>
        userClient.query(
          `
					WITH user := (
						INSERT User {
							id := <uuid>$userId,
							email := <optional str>$email,
							userRole := 'USER',
							identity := (global ext::auth::ClientTokenIdentity)
						}
						# If already created, stick with it, we can still create the profile
						unless conflict on .identity
						else (select User)
					)
          INSERT UserProfile {
            user := user,
            name := <str>$initialName,
            handle := <str>$initialHandle
          };
        `,
          {
            userId,
            email: factorData?.email,
            initialHandle,
            initialName,
          },
        ),
      catch: (error) => {
        console.error('Failed creating user profile', error)
        return new UnknownGelDBError(error)
      },
    }).pipe(
      ...buildTraceAndMetrics('create_user_profile', {
        isRetry,
      }),
    )
  })
}
