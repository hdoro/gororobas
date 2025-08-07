'use server'

import { Effect, pipe, Schema } from 'effect'
import { diff as jsonDiff } from 'json-diff-ts'
import { auth } from '@/gel'
import { insertEditSuggestionMutation } from '@/mutations'
import { m } from '@/paraglide/messages'
import {
  type VegetableForDBWithImages,
  VegetableWithUploadedImages,
} from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { UnknownGelDBError } from '@/types/errors'
import { paths } from '@/utils/urls'

/**
 * Thinking through editing vegetables:
 *
 * High-level workflow:
 * - Create an edit suggestion with a diff and snapshot
 * - The diff is in the shape of `json-diff-ts`
 * - Create a dashboard to review suggestions, admin only
 * - Admins can approve or reject suggestions
 * - When approved, the diff is applied to the vegetable
 *
 * Complications:
 * 1. Applying the diff is not trivial
 * 2. Ideally users should be able to see their own edit suggestions
 * 3. Ideally users would be notified when their suggestion is approved or rejected
 *
 * For now, skipping 2. and 3.
 *
 *
 * LEARNINGS WITH DIFFS
 * - When I ADD a friend, or any array of primitives, I get ADD, fine
 * - When I DELETE an item from an array of primitives, I get REMOVE, also fine
 * - But when I DELETE an item and add another at the same index, I get UPDATE, which could be tricky for friendships
 * 		- FIND WAY TO DELETE FRIENDSHIPS THAT WERE REMOVED
 * - Changes in arrays are grouped under the `changes` array
 * - Updating photos' meta is working fine
 * - Deleting a photo and uploading another on top changes the ID (via ImageInput), and leads to an ADD
 * - atomizeChangeset will flatten changes
 */
export async function createEditSuggestionAction({
  current,
  updated,
}: {
  current: VegetableForDBWithImages
  updated: VegetableForDBWithImages
}) {
  if (
    !Schema.is(VegetableWithUploadedImages)(current) ||
    !Schema.is(VegetableWithUploadedImages)(updated)
  ) {
    return {
      success: false,
      error: 'invalid-input',
    } as const
  }

  const diff = diffVegetableForDB({
    current,
    updated,
  })

  const session = await auth.getSession()

  return runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () =>
          insertEditSuggestionMutation.run(session.client, {
            diff: diff,
            target_id: current.id,
            snapshot: current,
          }),
        catch: (error) => new UnknownGelDBError(error),
      }),
      Effect.map(
        (createdObject) =>
          ({
            success: true,
            redirectTo: paths.editSuggestion(createdObject.id),

            message: {
              title: m.patchy_plane_sawfish_shine(),
              description: m.knotty_soft_mantis_create(),
            },
          }) as const,
      ),
      ...buildTraceAndMetrics('insert_edit_suggestion', {
        vegetable_id: current.id,
      }),
    ).pipe(
      Effect.catchAll(() =>
        // @TODO: better user-facing errors
        Effect.succeed({ success: false, error: 'unknown' } as const),
      ),
    ),
  )
}

function diffVegetableForDB({
  current,
  updated,
}: {
  current: VegetableForDBWithImages
  updated: VegetableForDBWithImages
}) {
  return jsonDiff(current, updated, {
    embeddedObjKeys: {
      photos: 'id',
      sources: 'id',
      varieties: 'id',
      tips: 'id',
      'tips.sources': 'id',
      'varieties.photos': 'id',
    },
  })
}
