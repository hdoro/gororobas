import type { TokenData } from '@gel/auth-nextjs/app'
import { Effect, Schema } from 'effect'

/**
 * We're only interested in the `displayName` and `email.value` subsets.
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
  ],
  "emailAddresses": [
    {
      "metadata": {
        "primary": true,
        "source": {
          "type": "PROFILE",
          "id": "PERSON_ID"
        },
        "sourcePrimary": true
      },
      "value": "email@example.com"
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
