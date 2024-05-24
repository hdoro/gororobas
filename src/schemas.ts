import type {
	EdiblePart,
	Gender,
	PlantingMethod,
	SourceType,
	Stratum,
	TipSubject,
	VegetableLifeCycle,
	VegetableUsage,
} from '@/types'
import { base64ToFile, fileToBase64 } from '@/utils/files'
import {
	EDIBLE_PART_TO_LABEL,
	GENDER_TO_LABEL,
	NOTE_TYPE_TO_LABEL,
	PLANTING_METHOD_TO_LABEL,
	STRATUM_TO_LABEL,
	TIP_SUBJECT_TO_LABEL,
	USAGE_TO_LABEL,
	VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { MAX_ACCEPTED_HEIGHT } from '@/utils/numbers'
import { ParseResult } from '@effect/schema'
import * as S from '@effect/schema/Schema'
import type { JSONContent } from '@tiptap/react'
import { Effect, pipe } from 'effect'
import type { NoteType } from './edgedb.interfaces'
import { FailedConvertingBlobError } from './types/errors'

/**
 * Custom optional schema to handle both EdgeDB and client-side forms:
 * - EdgeDB returns `null` instead of `undefined` for missing values
 * - Client-side forms return `undefined` for missing values
 */
const Optional = <A, I, R>(schema: S.Schema<A, I, R>) =>
	S.optional(S.NullishOr(schema))

const isFile = (input: unknown): input is File => input instanceof File

const FileSchema = S.declare(isFile)

const isTipTapJSON = (input: unknown): input is JSONContent & { version: 1 } =>
	typeof input === 'object' &&
	!!input &&
	'type' in input &&
	'version' in input &&
	input.version === 1

export const RichText = S.declare(isTipTapJSON)

export type RichTextValue = typeof RichText.Type

const SourceGororobasInForm = S.Struct({
	id: S.UUID,
	comments: Optional(RichText),
	type: S.Literal('GOROROBAS' satisfies SourceType),
	userIds: S.Array(S.UUID),
})

const SourceExternalInForm = S.Struct({
	id: S.UUID,
	comments: Optional(RichText),
	type: S.Literal('EXTERNAL' satisfies SourceType),
	credits: S.String.pipe(S.minLength(1)),
	origin: Optional(S.String),
})

export const SourceData = S.Union(SourceGororobasInForm, SourceExternalInForm)

const NewImageInForm = S.Struct({
	file: FileSchema,
})

const NewImageForDB = S.Struct({
	base64: S.String,
	fileName: S.String,
	mimeType: S.String,
})

export const NewImage = S.transformOrFail(NewImageInForm, NewImageForDB, {
	encode: (photoForDB) =>
		ParseResult.succeed({
			file: base64ToFile(
				photoForDB.base64,
				photoForDB.fileName,
				photoForDB.mimeType,
			),
		}),
	decode: (photoInForm, _, ast) =>
		Effect.mapBoth(
			Effect.tryPromise({
				try: () => fileToBase64(photoInForm.file),
				catch: (error) =>
					new FailedConvertingBlobError(error, photoInForm.file),
			}),
			{
				onSuccess: (base64) => ({
					base64,
					fileName: photoInForm.file.name,
					mimeType: photoInForm.file.type,
				}),
				onFailure: (e) =>
					new ParseResult.Type(ast, photoInForm, '@TODO type error'),
			},
		),
})

export const StoredImage = S.Struct({
	sanity_id: S.String,
	hotspot: Optional(S.Object),
	crop: Optional(S.Object),
})

export const ImageData = S.Struct({
	id: S.UUID,
	label: Optional(S.String),
	data: S.Union(NewImage, StoredImage),
	sources: Optional(S.Array(SourceData)),
})

export type NewImageData = Omit<typeof ImageData.Type, 'data'> & {
	data: typeof NewImage.Type
}

export type StoredImageData = Omit<typeof ImageData.Type, 'data'> & {
	data: typeof StoredImage.Type
}

/** What gets stored as an `Image` Object in EdgeDB */
const ImageObjectInDB = ImageData.pipe(S.omit('data'), S.extend(StoredImage))

type ImageObjectInDB = typeof ImageObjectInDB.Type

export const ImageDBToFormTransformer = S.transform(
	ImageObjectInDB,
	ImageData,
	{
		encode: (imageInForm) =>
			({
				...imageInForm,
				...imageInForm.data,
				// @TODO fail if not a stored image
			}) as any,
		decode: (imageInDb) => ({
			...imageInDb,
			data: S.decodeSync(StoredImage)(imageInDb),
		}),
	},
)

export const StringInArray = S.transform(
	S.Struct({
		value: S.String.pipe(S.minLength(1)).annotations({
			message: () => 'Ao menos 3 caracteres',
		}),
	}),
	S.String,
	{
		encode: (name) => ({ value: name }),
		decode: (nameInForm) => nameInForm.value,
	},
)

const VegetableVariety = S.Struct({
	id: S.UUID,
	names: S.NonEmptyArray(StringInArray),
	photos: Optional(S.Array(ImageData)),
})

const VegetableTip = S.Struct({
	id: S.UUID,
	subjects: S.Array(
		S.Literal(...(Object.keys(TIP_SUBJECT_TO_LABEL) as TipSubject[])),
	),
	content: RichText,
	sources: Optional(S.Array(SourceData)),
})

const Handle = S.String.pipe(
	S.minLength(1, {
		message: () => 'Obrigatório',
	}),
	S.minLength(3, {
		message: () => 'Obrigatório (mínimo de 3 caracteres)',
	}),
	S.pattern(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/, {
		message: () =>
			'O endereço não pode conter caracteres especiais, letras maiúsculas, espaços ou acentos',
	}),
)

export const VegetableData = S.Struct({
	id: S.UUID,
	names: S.NonEmptyArray(StringInArray),
	handle: Handle,
	scientific_names: Optional(S.Array(StringInArray)),
	origin: Optional(S.String),
	gender: Optional(S.Literal(...(Object.keys(GENDER_TO_LABEL) as Gender[]))),

	uses: Optional(
		S.Array(S.Literal(...(Object.keys(USAGE_TO_LABEL) as VegetableUsage[]))),
	),
	edible_parts: Optional(
		S.Array(S.Literal(...(Object.keys(EDIBLE_PART_TO_LABEL) as EdiblePart[]))),
	),
	lifecycles: Optional(
		S.Array(
			S.Literal(
				...(Object.keys(VEGETABLE_LIFECYCLE_TO_LABEL) as VegetableLifeCycle[]),
			),
		),
	),
	strata: Optional(
		S.Array(S.Literal(...(Object.keys(STRATUM_TO_LABEL) as Stratum[]))),
	),
	planting_methods: Optional(
		S.Array(
			S.Literal(...(Object.keys(PLANTING_METHOD_TO_LABEL) as PlantingMethod[])),
		),
	),
	height_min: Optional(
		S.Int.pipe(
			S.positive({ message: () => 'Altura deve ser um número positivo' }),
			S.lessThan(MAX_ACCEPTED_HEIGHT, {
				message: () => 'Que vegetal gigante e louco é esse?!',
			}),
		),
	),
	height_max: Optional(
		S.Int.pipe(
			S.positive({ message: () => 'Altura deve ser um número positivo' }),
			S.lessThan(MAX_ACCEPTED_HEIGHT, {
				message: () => 'Que vegetal gigante e louco é esse?!',
			}),
		),
	),
	temperature_min: Optional(
		S.Int.pipe(
			S.greaterThan(-50, {
				message: () => 'Que inverno gelado é esse que cê tá plantando?!',
			}),
			S.lessThan(60, {
				message: () => 'Que verão quente é esse que cê tá plantando?!',
			}),
		),
	),
	temperature_max: Optional(
		S.Int.pipe(
			S.greaterThan(-50, {
				message: () => 'Que inverno gelado é esse que cê tá plantando?!',
			}),
			S.lessThan(60, {
				message: () => 'Que verão quente é esse que cê tá plantando?!',
			}),
		),
	),

	varieties: Optional(S.Array(VegetableVariety)),
	tips: Optional(S.Array(VegetableTip)),
	photos: Optional(S.Array(ImageData)),
	content: Optional(RichText),
	friends: Optional(S.Array(S.UUID)),
	sources: Optional(S.Array(SourceData)),
}).pipe(
	S.filter((vegetable, _, ast) => {
		if (
			typeof vegetable.height_min !== 'number' ||
			typeof vegetable.height_max !== 'number'
		)
			return

		// @TODO: how to return a path to a field?
		return vegetable.height_max < vegetable.height_min
			? new ParseResult.Type(
					ast,
					vegetable.height_min,
					'Altura mínima deve ser menor que a máxima',
				)
			: undefined
	}),
)

export type VegetableVarietyForDB = typeof VegetableVariety.Type
export type VegetableVarietyInForm = typeof VegetableVariety.Encoded

export type VegetableTipForDB = typeof VegetableTip.Type
export type VegetableTipInForm = typeof VegetableTip.Encoded

export type VegetableForDB = typeof VegetableData.Type
export type VegetableInForm = typeof VegetableData.Encoded

export type SourceForDB = typeof SourceData.Type

export const ProfileData = S.Struct({
	id: S.UUID,
	handle: Handle,
	name: S.String.pipe(S.minLength(1)),
	photo: S.transformOrFail(S.Any, S.Union(S.Undefined, ImageData), {
		decode: (value) =>
			pipe(
				// We can validate only the data field
				S.validate(S.Union(NewImageInForm, StoredImage))(value?.data),
				// If it's valid, return the full `value` - Schema will decode it with ImageData after the transformation
				Effect.map(() => value),
				// Otherwise, return undefined
				Effect.catchAll(() => Effect.succeed(undefined)),
			),
		encode: () => Effect.succeed({}),
		strict: false,
	}),
	location: Optional(S.String),
	bio: Optional(RichText),
})

export type ProfileDataForDB = typeof ProfileData.Type
export type ProfileDataInForm = typeof ProfileData.Encoded

export const NoteData = S.Struct({
	id: S.UUID,
	published_at: S.Union(S.Date, S.DateFromSelf),
	title: RichText,
	body: Optional(RichText),
	public: S.Boolean,
	types: S.NonEmptyArray(
		S.Literal(...(Object.keys(NOTE_TYPE_TO_LABEL) as NoteType[])),
	),
	handle: Optional(Handle),
	created_by: Optional(S.UUID),
})

export type NoteForDB = typeof NoteData.Type
export type NoteInForm = typeof NoteData.Encoded

export const NoteDataArray = S.NonEmptyArray(NoteData)
export type NotesForDB = typeof NoteDataArray.Type
