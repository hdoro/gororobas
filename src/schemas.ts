/**
 * Schema suffix naming conventions:
 *
 * - `InForm`: data as it comes from the form, with all optional fields
 * - `ForDB`: data as it is stored in the database, with all required fields
 * - `Data`: isomorphic, either the same shape of the form and the database or a transformed schema (encoded in Form / decoded in DB)
 * - `Type`: TS type
 */

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
import { FailedUploadingImageError } from './types/errors'

/**
 * Custom optional schema to handle both EdgeDB and client-side forms:
 * - EdgeDB returns `null` instead of `undefined` for missing values
 * - Client-side forms return `undefined` for missing values
 */
const Optional = <A, I, R>(schema: S.Schema<A, I, R>) =>
	S.optional(S.NullishOr(schema))

const isFile = (input: unknown): input is File => input instanceof File

const FileSchema = S.declare(isFile)

export type RichTextValue = JSONContent & { version: 1 }
const isTipTapJSON = (input: unknown): input is RichTextValue =>
	typeof input === 'object' &&
	!!input &&
	'type' in input &&
	'version' in input &&
	input.version === 1

/**
 * When sending to DB via server actions, we need to stringify the object to ensure
 * classes don't break React server actions. Tiptap's `editor.getJSON()` includes some classes
 * in its structure, such as the value of the Link extension which holds its `href` value as an `URL` instance.
 *
 * This has no other effective change, no data is modified or lost.
 * 💡 When using schemas with RichText in `useForm`, give preference to passing `Schema.encodedBoundSchema` and only
 * decoding before sending to the server to save compute in form validations. This JSON clone is expensive.
 */
export const RichText = S.transform(
	S.declare(isTipTapJSON),
	S.declare(isTipTapJSON),
	{
		strict: true,
		encode: (richTextInDB) => richTextInDB,
		decode: (richTextInForm) => JSON.parse(JSON.stringify(richTextInForm)),
	},
)

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

export const SourceInForm = S.Union(SourceGororobasInForm, SourceExternalInForm)

export const NewImageDataInForm = S.Struct({
	file: FileSchema,
})

export const StoredImageDataInForm = S.Struct({
	sanity_id: S.String,
	hotspot: Optional(S.Object),
	crop: Optional(S.Object),
})

export const ImageInForm = S.Struct({
	id: S.UUID,
	label: Optional(S.String),
	data: S.Union(NewImageDataInForm, StoredImageDataInForm),
	sources: Optional(S.Array(SourceInForm)),
})

export type NewImageData = Omit<typeof ImageInForm.Type, 'data'> & {
	data: typeof NewImageDataInForm.Type
}

/** What gets stored as an `Image` Object in EdgeDB */
export const StoredImageInForm = ImageInForm.pipe(
	S.omit('data'),
	S.extend(
		S.Struct({
			data: StoredImageDataInForm,
		}),
	),
)
export type StoredImageInFormType = typeof StoredImageInForm.Type

export const ImageObjectInDB = ImageInForm.pipe(
	S.omit('data'),
	S.extend(StoredImageDataInForm),
)

/**
 * encoded: form;
 * decoded: DB;
 */
export const ImageFormToDBTransformer = S.transformOrFail(
	ImageInForm,
	ImageObjectInDB,
	{
		strict: true,
		encode: (imageInDB) =>
			ParseResult.succeed({
				...imageInDB,
				data: {
					sanity_id: imageInDB.sanity_id,
					hotspot: imageInDB.hotspot,
					crop: imageInDB.crop,
				},
			}),
		decode: (imageInForm, _, ast) =>
			Effect.gen(function* (_) {
				const { data } = imageInForm
				if (S.is(StoredImageDataInForm)(data)) {
					return {
						id: imageInForm.id,
						label: imageInForm.label,
						sources: imageInForm.sources,
						sanity_id: data.sanity_id,
						hotspot: data.hotspot,
						crop: data.crop,
					} satisfies typeof ImageObjectInDB.Type
				}

				const formData = new FormData()
				formData.append('file', data.file)
				const result = yield* _(
					Effect.tryPromise({
						try: () =>
							fetch('/api/images', {
								method: 'POST',
								body: formData,
							}).then((response) => response.json()),
						catch: (error) => new FailedUploadingImageError(error, data.file),
					}),
				)

				if (
					!result ||
					'error' in result ||
					!('sanity_id' in result) ||
					typeof result.sanity_id !== 'string'
				) {
					return yield* Effect.fail(
						new FailedUploadingImageError(result.error, data.file),
					)
				}

				return {
					id: imageInForm.id,
					sanity_id: result.sanity_id,
					label: imageInForm.label,
					sources: imageInForm.sources,
					hotspot: undefined,
					crop: undefined,
				} satisfies typeof ImageObjectInDB.Type
			}).pipe(
				Effect.catchAll(() =>
					ParseResult.fail(
						new ParseResult.Type(ast, imageInForm, 'failed-uploading-images'),
					),
				),
			),
	},
)

export const ImageDBToFormTransformer = S.transformOrFail(
	ImageObjectInDB,
	ImageInForm,
	{
		encode: (imageInForm, _, ast) => {
			if (S.is(StoredImageDataInForm)(imageInForm)) {
				const { data: _data, ...encoded } = {
					...imageInForm,
					...imageInForm.data,
				}
				return Effect.succeed(encoded)
			}

			// can't encode a `NewImage`; they won't be in the DB anyways
			return Effect.fail(new ParseResult.Forbidden(ast, imageInForm))
		},
		decode: (imageInDb) =>
			ParseResult.succeed({
				...imageInDb,
				data: {
					sanity_id: imageInDb.sanity_id,
					hotspot: imageInDb.hotspot,
					crop: imageInDb.crop,
				},
			}),
	},
)

const Name = S.String.pipe(
	S.minLength(3, {
		message: () => 'Nomes precisam de ao menos 3 caracteres',
	}),
	S.maxLength(40, {
		message: () => 'Nomes não podem ir além de 40 caracteres',
	}),
)

export const NameInArray = S.transform(
	S.Struct({
		value: Name,
	}),
	Name,
	{
		encode: (name) => ({ value: name }),
		decode: (nameInForm) => nameInForm.value,
	},
)

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

export const VegetableVarietyData = S.Struct({
	id: S.UUID,
	handle: Optional(Handle),
	names: S.NonEmptyArray(NameInArray),
	photos: Optional(S.Array(ImageInForm)),
})

export type VegetableVarietyInForm = typeof VegetableVarietyData.Encoded

const VegetableTipData = S.Struct({
	id: S.UUID,
	handle: Optional(Handle),
	subjects: S.Array(
		S.Literal(...(Object.keys(TIP_SUBJECT_TO_LABEL) as TipSubject[])),
	),
	content: RichText,
	sources: Optional(S.Array(SourceInForm)),
})

export type VegetableTipForDB = typeof VegetableTipData.Type
export type VegetableTipInForm = typeof VegetableTipData.Encoded

export const VegetableData = S.Struct({
	/** Exists only if Vegetable's already in DB */
	id: Optional(S.UUID),
	names: S.NonEmptyArray(NameInArray),
	handle: Handle,
	scientific_names: Optional(S.Array(NameInArray)),
	origin: Optional(
		S.String.pipe(
			S.maxLength(40, {
				message: () => 'A origem tem de ser menor que 40 caracteres',
			}),
		),
	),
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
	content: Optional(RichText),
	friends: Optional(S.Array(S.UUID)),
	varieties: Optional(S.Array(VegetableVarietyData)),
	tips: Optional(S.Array(VegetableTipData)),
	photos: Optional(S.Array(ImageInForm)),
	sources: Optional(S.Array(SourceInForm)),
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

export type VegetableInForm = typeof VegetableData.Encoded

export const VegetableWithUploadedImages = VegetableData.pipe(
	S.omit('photos', 'varieties'),
	S.extend(
		S.Struct({
			photos: Optional(S.Array(ImageFormToDBTransformer)),
			varieties: Optional(
				S.Array(
					VegetableVarietyData.pipe(
						S.omit('photos'),
						S.extend(
							S.Struct({
								photos: Optional(S.Array(ImageFormToDBTransformer)),
							}),
						),
					),
				),
			),
		}),
	),
)

export type VegetableForDB = typeof VegetableWithUploadedImages.Type
export type VegetableVarietyForDB = Exclude<
	VegetableForDB['varieties'],
	null | undefined
>[number]

export type SourceForDB = typeof SourceInForm.Type

export const ProfileData = S.Struct({
	id: S.UUID,
	handle: Handle,
	name: Name,
	// @TODO make less messy
	photo: S.transformOrFail(S.Any, S.Union(S.Undefined, ImageInForm), {
		decode: (value) =>
			pipe(
				// We can validate only the data field
				S.validate(S.Union(NewImageDataInForm, StoredImageDataInForm))(
					value?.data,
				),
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

/** Profiles can be partially updated. Photo should be sent to the DB first. */
export const ProfileDataToUpdate = S.partial(
	ProfileData.pipe(S.omit('id', 'photo')),
).pipe(
	S.extend(ProfileData.pipe(S.pick('id'))),
	S.extend(
		S.Struct({
			photo: Optional(ImageFormToDBTransformer),
		}),
	),
)

export const NoteData = S.Struct({
	/** Exists only if Note's already in DB */
	id: Optional(S.UUID),
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
