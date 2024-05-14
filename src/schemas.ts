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
import type { EditorState, SerializedElementNode } from 'lexical'

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
): input is SerializedElementNode['children'] => Array.isArray(input)

const LexicalJSON = S.declare(isLexicalJSON)

const RichText = S.transform(LexicalEditorState, LexicalJSON, {
	encode: (json) => ({}) as any,
	decode: (state) => state.toJSON().root.children,
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

export const StoredImage = S.Struct({
	stored_image_id: S.UUID,
	sanity_id: S.String,
	hotspot: S.optional(S.Object),
	crop: S.optional(S.Object),
})

const Image = S.Struct({
	label: S.String,
	data: S.Union(NewImage, StoredImage),
}).pipe(S.extend(S.partial(Source)))

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
	photos: S.optional(S.Array(Image)),
})

const VegetableTipInForm = S.extend(
	S.Struct({
		id: S.UUID,
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
	// @TODO: plural or singular?
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
	tips: S.optional(S.Array(VegetableTipInForm)),
	photos: S.optional(S.Array(Image)),
	content: S.optional(RichText),
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

export type SourceForDB = typeof Source.Type
