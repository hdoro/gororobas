import type { TokenData } from '@gel/auth-nextjs/app'
import { Effect, Schema } from 'effect'

/**
 * We're only interested in the `displayName` subset.
 * Example of a full response:
 * {
  "resourceName": "people/PERSON_ID",
  "etag": "%RANDOM_KEY",
  "names": [
    {
      "metadata": {
        "primary": true,
        "source": {
          "type": "PROFILE",
          "id": "PERSON_ID"
        },
        "sourcePrimary": true
      },
      "displayName": "NAME LASTNAME",
      "familyName": "LASTNAME",
      "givenName": "NAME",
      "displayNameLastFirst": "LASTNAME, NAME",
      "unstructuredName": "NAME LASTNAME"
    },
    {
      "metadata": {
        "source": {
          "type": "DOMAIN_PROFILE",
          "id": "PERSON_ID"
        }
      },
      "displayName": "NAME LASTNAME",
      "familyName": "LASTNAME",
      "givenName": "NAME",
      "displayNameLastFirst": "LASTNAME, NAME",
      "unstructuredName": "NAME LASTNAME"
    }
  ]
}
 */
const GooglePeopleAPIMinimalResponse = Schema.Struct({
  names: Schema.Array(
    Schema.Struct({
      displayName: Schema.String,
    }),
  ),
})

export default function getGoogleName(tokenData: TokenData) {
  return Effect.gen(function* (_) {
    const response = yield* Effect.tryPromise(() =>
      fetch('https://people.googleapis.com/v1/people/me?personFields=names', {
        headers: { Authorization: `Bearer ${tokenData.provider_token}` },
      }).then((response) => response.json()),
    )
    const person = yield* Schema.decodeUnknown(GooglePeopleAPIMinimalResponse)(
      response,
    )

    return person.names.find((name) => name.displayName)?.displayName || null
  })
}
