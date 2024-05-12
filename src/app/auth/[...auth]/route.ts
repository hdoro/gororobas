import { auth } from '@/edgedb'
import { generateId } from '@/utils/ids'
import { slugify } from '@/utils/strings'
import { redirect } from 'next/navigation'

export const { GET, POST } = auth.createAuthRouteHandlers({
	async onBuiltinUICallback({ error, tokenData, isSignUp }) {
		if (error) {
			console.error('sign in failed', error)
		}
		if (!tokenData) {
			console.log('email verification required')
		}
		if (isSignUp) {
			const userClient = auth.getSession().client.withConfig({
				allow_user_specified_id: true,
				// Skip access policies as users can't create `User` objects
				apply_access_policies: false,
			})

			const emailData = await userClient.querySingle<{ email: string }>(`
        SELECT ext::auth::EmailFactor {
          email
        } FILTER .identity = (global ext::auth::ClientTokenIdentity)
      `)

			const userId = generateId()
			const initialName = emailData?.email.split('@')[0]
			const initialHandle = slugify(`${initialName}-${userId.slice(0, 6)}`)
			await userClient.query(
				`
        INSERT User {
          id := <uuid>$userId,
          email := <str>$email,
          userRole := 'USER',
          identity := (global ext::auth::ClientTokenIdentity)
        };

        INSERT UserProfile {
          user := (
            select User
            filter .id = <uuid>$userId
          ),
          name := <str>$initialName,
          handle := <str>$initialHandle
        };
      `,
				{
					userId,
					email: emailData?.email,
					initialHandle,
					initialName,
				},
			)
		}
		redirect('/')
	},
	onSignout() {
		redirect('/')
	},
})
