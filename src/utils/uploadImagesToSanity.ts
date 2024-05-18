import { type ImageData, NewImage, type NewImageData } from '@/schemas'
import { buildTraceAndMetrics, runServerEffect } from '@/services/runtime'
import { FailedUploadingImageError } from '@/types/errors'
import { Schema } from '@effect/schema'
import { Effect, pipe } from 'effect'
import { base64ToBlob } from './files'
import { sanityServerClient } from './sanity.client'

export function uploadImagesToSanity(images: (typeof ImageData.Type)[]) {
	const toUpload = images.flatMap((image) =>
		Schema.is(NewImage)(image.data) ? (image as NewImageData) : [],
	)

	return runServerEffect(
		pipe(
			Effect.forEach(toUpload, (image) =>
				pipe(
					Effect.tryPromise({
						try: () => base64ToBlob(image.data.base64),
						catch: (error) => new FailedUploadingImageError(error, image),
					}),
					Effect.flatMap((blob) =>
						Effect.tryPromise({
							try: () => sanityServerClient.assets.upload('image', blob),
							catch: (error) => new FailedUploadingImageError(error, image),
						}),
					),
					Effect.tapError((error) =>
						Effect.logError('Failed uploading image', error.error),
					),
					Effect.map((document) => ({
						stored_id: image.id,
						sanity_id: document._id,
					})),
					...buildTraceAndMetrics('upload_image_to_sanity', {
						image_id: image.id,
					}),
					Effect.catchAll((error) =>
						Effect.succeed({ stored_id: image.id, error }),
					),
				),
			),
			Effect.map((uploaded) =>
				Object.fromEntries(uploaded.map((image) => [image.stored_id, image])),
			),
		),
	)
}
