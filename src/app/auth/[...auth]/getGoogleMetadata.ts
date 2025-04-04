import type { TokenData } from '@gel/auth-nextjs/app'
import { Effect, Schema } from 'effect'

/**
 * We're only interested in the `displayName` and `email.value` subsets.
 * @docs https://developers.google.com/people/api/rest/v1/people
 **/
const GooglePeopleAPIMinimalResponse = Schema.Struct({
  names: Schema.Array(
    Schema.Struct({
      displayName: Schema.String,
    }),
  ),
  emailAddresses: Schema.Array(
    Schema.Struct({
      value: Schema.String,
    }),
  ),
})

export default function getGoogleMetadata(tokenData: TokenData) {
  return Effect.gen(function* (_) {
    const response = yield* Effect.tryPromise(() =>
      fetch(
        'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses',
        {
          headers: { Authorization: `Bearer ${tokenData.provider_token}` },
        },
      ).then((response) => response.json()),
    )
    const person = yield* Schema.decodeUnknown(GooglePeopleAPIMinimalResponse)(
      response,
    )

    return {
      name: person.names.find((name) => name.displayName)?.displayName || null,
      email: person.emailAddresses.find((email) => email.value)?.value || null,
    }
  })
}
