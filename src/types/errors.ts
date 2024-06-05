export class FailedUploadingImageError {
	readonly _tag = 'FailedUploadingImage'

	constructor(
		readonly error: unknown,
		readonly file: File,
	) {}
}

// @TODO differentiate errors from EdgeDB
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

export class SigninFailedError {
	readonly _tag = 'SigninFailed'

	constructor(readonly error: unknown) {}
}

export class EmailNotVerifiedError {
	readonly _tag = 'export class EmailNotVerified'
}
