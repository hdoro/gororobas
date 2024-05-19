import type { NewImageData } from '@/schemas'

export class FailedUploadingImageError {
	readonly _tag = 'FailedUploadingImage'

	constructor(
		readonly error: unknown,
		readonly image: NewImageData,
	) {}
}

export class UnknownEdgeDBError {
	readonly _tag = 'EdgeDBError'

	constructor(
		readonly error: unknown,
		readonly query?: string,
	) {}
}

export class InvalidInputError {
	readonly _tag = 'InvalidInput'

	constructor(
		readonly input: unknown,
		readonly schema: unknown,
	) {}
}

export class FailedConvertingBlobError {
	readonly _tag = 'FailedConvertingBlob'

	constructor(
		readonly error: unknown,
		readonly blob: Blob | File | string,
	) {}
}
