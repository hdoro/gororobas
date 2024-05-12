import type {
	Gender,
	PlantingMethod,
	SourceType,
	Stratum,
	TipSubject,
	VegetableEdiblePart,
	VegetableLifecycle,
	VegetableUsage,
} from '@/types'
import { base64ToFile, fileToBase64 } from '@/utils/files'
import {
	EDIBLE_PART_TO_LABEL,
	GENDER_TO_LABEL,
	PLANTING_METHOD_TO_LABEL,
	STRATUM_TO_LABEL,
	TIP_SUBJECT_TO_LABEL,
	USAGE_TO_LABEL,
	VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { MAX_ACCEPTED_HEIGHT } from '@/utils/numbers'
import { ParseResult } from '@effect/schema'
import * as S from '@effect/schema/Schema'
import { Effect } from 'effect'
import type {
	EditorState,
	SerializedEditorState,
	SerializedLexicalNode,
} from 'lexical'

const SourceGororobasInForm = S.Struct({
	sourceType: S.Literal('GOROROBAS' satisfies SourceType),
	userIds: S.Array(S.UUID),
})

const SourceExternalInForm = S.Struct({
	sourceType: S.Literal('EXTERNAL' satisfies SourceType),
	credits: S.String.pipe(S.minLength(1)),
	source: S.optional(S.String),
})

const Source = S.Union(SourceGororobasInForm, SourceExternalInForm)

const isFile = (input: unknown): input is File => input instanceof File

const FileSchema = S.declare(isFile)

const isLexicalEditorState = (input: unknown): input is EditorState =>
	typeof input === 'object' && !!input && '_nodeMap' in input

const LexicalEditorState = S.declare(isLexicalEditorState)

const isLexicalJSON = (
	input: unknown,
): input is SerializedEditorState<SerializedLexicalNode> =>
	typeof input === 'object'

const LexicalJSON = S.declare(isLexicalJSON)

const RichText = S.transform(LexicalEditorState, LexicalJSON, {
	encode: (json) => ({}) as any,
	decode: (state) => state.toJSON(),
})

export const NewImage = S.transformOrFail(
	S.Struct({
		file: FileSchema,
	}),

	S.Struct({
		base64: S.String,
		fileName: S.String,
		mimeName: S.String,
	}),
	{
		encode: (photoForDB) =>
			ParseResult.succeed({
				file: base64ToFile(
					photoForDB.base64,
					photoForDB.fileName,
					photoForDB.mimeName,
				),
			}),
		decode: (photoInForm, _, ast) =>
			Effect.mapBoth(
				Effect.tryPromise({
					try: () => fileToBase64(photoInForm.file),
					catch: (error) => '@TODO type error',
				}),
				{
					onSuccess: (base64) => ({
						base64,
						fileName: photoInForm.file.name,
						mimeName: photoInForm.file.type,
					}),
					onFailure: (e) =>
						new ParseResult.Type(ast, photoInForm, '@TODO type error'),
				},
			),
	},
)

const StoredImage = S.Struct({
	storedPhotoId: S.UUID,
})

const Image = S.Struct({
	label: S.String,
	data: S.Union(NewImage, StoredImage),
}).pipe(S.extend(Source))

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
	names: S.NonEmptyArray(StringInArray),
	photos: S.optional(S.Array(Image)),
})

const VegetableVarietyInForm = S.extend(
	VegetableVariety,
	S.Struct({
		// When editing vegetables, existing varieties will include their current data in the DB
		inDb: S.optional(S.extend(VegetableVariety, S.Struct({ id: S.String }))),
	}),
)

const VegetableTipInputValue = S.extend(
	S.Struct({
		subjects: S.Array(
			S.Literal(...(Object.keys(TIP_SUBJECT_TO_LABEL) as TipSubject[])),
		),
		content: RichText,
	}),
	Source,
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

export const Vegetable = S.Struct({
	names: S.NonEmptyArray(StringInArray),
	handle: Handle,
	scientific_names: S.NonEmptyArray(StringInArray),
	origin: S.optional(S.String),
	gender: S.Literal(...(Object.keys(GENDER_TO_LABEL) as Gender[])),

	uses: S.Array(S.Literal(...(Object.keys(USAGE_TO_LABEL) as VegetableUsage[])))
		.pipe(S.minItems(1))
		.annotations({
			message: () => 'Marque ao menos uma opção',
		}),
	// @TODO: plural or singular?
	edible_parts: S.optional(
		S.Array(
			S.Literal(
				...(Object.keys(EDIBLE_PART_TO_LABEL) as VegetableEdiblePart[]),
			),
		),
	),
	lifecycles: S.optional(
		S.Array(
			S.Literal(
				...(Object.keys(VEGETABLE_LIFECYCLE_TO_LABEL) as VegetableLifecycle[]),
			),
		),
	),
	strata: S.Array(S.Literal(...(Object.keys(STRATUM_TO_LABEL) as Stratum[])))
		.pipe(S.minItems(1))
		.annotations({
			message: () => 'Marque ao menos uma opção',
		}),
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

	varieties: S.optional(S.Array(VegetableVarietyInForm)),
	tips: S.optional(S.Array(VegetableTipInputValue)),
	photos: S.optional(S.Array(Image)),
	content: RichText,
}).pipe(
	S.filter((vegetable, _, ast) => {
		if (
			typeof vegetable.height_min !== 'number' ||
			typeof vegetable.height_max !== 'number'
		)
			return

		// @TODO: how to return a path?
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

export type VegetableForDB = typeof Vegetable.Type
export type VegetableInForm = typeof Vegetable.Encoded
