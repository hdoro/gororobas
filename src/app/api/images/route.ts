import { auth } from '@/edgedb'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { FailedUploadingImageError } from '@/types/errors'
import { BASE_URL } from '@/utils/config'
import { sanityServerClient } from '@/utils/sanity.client'
import { Effect, pipe } from 'effect'

export async function POST(request: Request): Promise<Response> {
  const session = await auth.getSession()
  const origin = request.headers.get('origin') || request.headers.get('referer')

  if (
    !(await session.isSignedIn()) ||
    !origin ||
    !URL.canParse(origin) ||
    new URL(origin).hostname !== new URL(BASE_URL).hostname
  )
    return new Response('Unauthorized', { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File))
    return new Response('Bad Request', { status: 400 })

  const result = await uploadImageToSanity(file)

  if ('error' in result) {
    return new Response(null, { status: 500 })
  }

  return Response.json(result, { status: 200 })
}

function uploadImageToSanity(image: File) {
  return runServerEffect(
    pipe(
      Effect.tryPromise({
        try: () => sanityServerClient.assets.upload('image', image),
        catch: (error) => new FailedUploadingImageError(error, image),
      }),
      Effect.tapError((error) =>
        Effect.logError('Failed uploading image', error.error),
      ),
      Effect.map((document) => ({
        sanity_id: document._id,
      })),
      ...buildTraceAndMetrics('upload_image_to_sanity', {
        file_size: image.size,
        file_type: image.type,
      }),
    ).pipe(Effect.catchAll((error) => Effect.succeed({ error }))),
  )
}
