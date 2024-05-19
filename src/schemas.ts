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
import { Effect } from 'effect'
import type { NoteType } from './edgedb.interfaces'
import { FailedConvertingBlobError } from './types/errors'

const SourceGororobasInForm = S.Struct({
	id: S.UUID,
	type: S.Literal('GOROROBAS' satisfies SourceType),
	userIds: S.Array(S.UUID),
})

const SourceExternalInForm = S.Struct({
	id: S.UUID,
	type: S.Literal('EXTERNAL' satisfies SourceType),
	credits: S.String.pipe(S.minLength(1)),
	origin: S.optional(S.String),
})

export const SourceData = S.Union(SourceGororobasInForm, SourceExternalInForm)

const isFile = (input: unknown): input is File => input instanceof File

const FileSchema = S.declare(isFile)

const isTipTapJSON = (input: unknown): input is JSONContent & { version: 1 } =>
	typeof input === 'object' &&
	!!input &&
	'type' in input &&
	'version' in input &&
	input.version === 1

export const RichText = S.declare(isTipTapJSON)

export const NewImage = S.transformOrFail(
	S.Struct({
		file: FileSchema,
	}),

	S.Struct({
		base64: S.String,
		fileName: S.String,
		mimeType: S.String,
	}),
	{
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
	},
)

export const StoredImage = S.Struct({
	sanity_id: S.String,
	hotspot: S.optional(S.Object, { nullable: true }),
	crop: S.optional(S.Object, { nullable: true }),
})

export const ImageData = S.Struct({
	id: S.UUID,
	label: S.optional(S.String, { nullable: true }),
	data: S.Union(NewImage, StoredImage),
	sources: S.optional(S.Array(SourceData)),
})

export type NewImageData = Omit<typeof ImageData.Type, 'data'> & {
	data: typeof NewImage.Type
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
		value: S.String.pipe(S.minLength(3)).annotations({
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
	photos: S.optional(S.Array(ImageData)),
})

const VegetableTip = S.Struct({
	id: S.UUID,
	subjects: S.Array(
		S.Literal(...(Object.keys(TIP_SUBJECT_TO_LABEL) as TipSubject[])),
	),
	content: RichText,
	sources: S.optional(S.Array(SourceData)),
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

export const Vegetable = S.Struct({
	id: S.UUID,
	names: S.NonEmptyArray(StringInArray),
	handle: Handle,
	scientific_names: S.optional(S.Array(StringInArray)),
	origin: S.optional(S.String),
	gender: S.optional(S.Literal(...(Object.keys(GENDER_TO_LABEL) as Gender[]))),

	uses: S.optional(
		S.Array(S.Literal(...(Object.keys(USAGE_TO_LABEL) as VegetableUsage[])))
			.pipe(S.minItems(1))
			.annotations({
				message: () => 'Marque ao menos uma opção',
			}),
	),
	edible_parts: S.optional(
		S.Array(S.Literal(...(Object.keys(EDIBLE_PART_TO_LABEL) as EdiblePart[]))),
	),
	lifecycles: S.optional(
		S.Array(
			S.Literal(
				...(Object.keys(VEGETABLE_LIFECYCLE_TO_LABEL) as VegetableLifeCycle[]),
			),
		),
	),
	strata: S.optional(
		S.Array(S.Literal(...(Object.keys(STRATUM_TO_LABEL) as Stratum[])))
			.pipe(S.minItems(1))
			.annotations({
				message: () => 'Marque ao menos uma opção',
			}),
	),
	planting_methods: S.optional(
		S.Array(
			S.Literal(...(Object.keys(PLANTING_METHOD_TO_LABEL) as PlantingMethod[])),
		),
	),
	height_min: S.optional(
		S.Int.pipe(
			S.positive({ message: () => 'Altura deve ser um número positivo' }),
			S.lessThan(MAX_ACCEPTED_HEIGHT, {
				message: () => 'Que vegetal gigante e louco é esse?!',
			}),
		),
	),
	height_max: S.optional(
		S.Int.pipe(
			S.positive({ message: () => 'Altura deve ser um número positivo' }),
			S.lessThan(MAX_ACCEPTED_HEIGHT, {
				message: () => 'Que vegetal gigante e louco é esse?!',
			}),
		),
	),
	temperature_min: S.optional(
		S.Int.pipe(
			S.greaterThan(-50, {
				message: () => 'Que inverno gelado é esse que cê tá plantando?!',
			}),
			S.lessThan(60, {
				message: () => 'Que verão quente é esse que cê tá plantando?!',
			}),
		),
	),
	temperature_max: S.optional(
		S.Int.pipe(
			S.greaterThan(-50, {
				message: () => 'Que inverno gelado é esse que cê tá plantando?!',
			}),
			S.lessThan(60, {
				message: () => 'Que verão quente é esse que cê tá plantando?!',
			}),
		),
	),

	varieties: S.optional(S.Array(VegetableVariety)),
	tips: S.optional(S.Array(VegetableTip)),
	photos: S.optional(S.Array(ImageData)),
	content: S.optional(RichText),
	friends: S.optional(S.Array(S.UUID)),
	sources: S.optional(S.Array(SourceData)),
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

export type VegetableVarietyInForm = typeof VegetableVariety.Encoded
export type VegetableTipInForm = typeof VegetableTip.Encoded

export type VegetableForDB = typeof Vegetable.Type
export type VegetableInForm = typeof Vegetable.Encoded

export type SourceForDB = typeof SourceData.Type

export const ProfileData = S.Struct({
	id: S.UUID,
	handle: Handle,
	name: S.String.pipe(S.minLength(3)),
	photo: S.optional(ImageData),
	location: S.optional(S.String),
	bio: S.optional(RichText),
})

export type ProfileDataForDB = typeof ProfileData.Type
export type ProfileDataInForm = typeof ProfileData.Encoded

export const NoteData = S.Struct({
	id: S.UUID,
	published_at: S.Union(S.Date, S.DateFromSelf),
	handle: Handle,
	title: RichText,
	body: S.optional(RichText),
	public: S.Boolean,
	types: S.NonEmptyArray(
		S.Literal(...(Object.keys(NOTE_TYPE_TO_LABEL) as NoteType[])),
	),
	created_by: S.UUID,
})

export type NoteForDB = typeof NoteData.Type
export type NoteInForm = typeof NoteData.Encoded

export const NoteDataArray = S.NonEmptyArray(NoteData)
export type NotesForDB = typeof NoteDataArray.Type
