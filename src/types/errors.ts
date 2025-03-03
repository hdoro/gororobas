export class FailedUploadingImageError {
  readonly _tag = 'FailedUploadingImage'

  constructor(
    readonly error: unknown,
    readonly file: File,
  ) {}
}

// @TODO differentiate errors from GelDB
export class UnknownGelDBError {
  readonly _tag = 'GelDBError'

  constructor(
    readonly error: unknown,
    readonly query?: string,
  ) {}
}

export class NoteUpdateFailedError {
  readonly _tag = 'NoteUpdateFailed'

  constructor(
    readonly error: unknown,
    readonly note_id: string,
  ) {}
}

export class InvalidInputError {
  readonly _tag = 'InvalidInput'

  constructor(
    readonly input: unknown,
    readonly schema: unknown,
  ) {}
}

export class UnkownActionError {
  readonly _tag = 'UnkownAction'

  constructor(readonly error: unknown) {}
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
  readonly _tag = 'EmailNotVerified'
}

export class UnauthorizedError {
  readonly _tag = 'Unauthorized'
}

export class NotFoundError {
  readonly _tag = 'NotFound'
}
