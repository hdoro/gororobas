import type { NewImageData } from '@/schemas'

export class FailedUploadingImageError {
	readonly _tag = 'FailedUploadingImage'

	constructor(
		readonly error: unknown,
		readonly image: NewImageData,
	) {}
}
