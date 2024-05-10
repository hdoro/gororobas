import type {
  Gender,
  PlantingMethod,
  SourceType,
  Stratum,
  VegetableEdiblePart,
  VegetableLifecycle,
  VegetableUsage,
} from '@/types'
import {
  EDIBLE_PART_TO_LABEL,
  GENDER_TO_LABEL,
  PLANTING_METHOD_TO_LABEL,
  STRATUM_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import * as S from '@effect/schema/Schema'
import type { EditorState } from 'lexical'
import { MAX_ACCEPTED_HEIGHT } from './utils/numbers'

/**
 * Missing data:
 * - Varieties
 * - Photos
 * - Suggestions & tips
 * - Rich text
 */

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

const PhotoInputValue = S.extend(
  S.Struct({
    photo: FileSchema,
    label: S.String,
  }),
  // Although we'll store sources as an array, for now we're only allowing a single source
  Source,
)

const StringArrayInputValue = S.Struct({
  value: S.String.pipe(S.minLength(3)).annotations({
    message: () => 'Nome deve ter ao menos 3 caracteres',
  }),
  id: S.optional(S.String),
})

export const stringArrayTransformer = S.transform(
  StringArrayInputValue,
  S.String,
  {
    decode: (nameInForm) => nameInForm.value,
    encode: (name) => ({ value: name }),
  },
)

const VegetableVariety = S.Struct({
  names: S.Array(StringArrayInputValue).pipe(S.minItems(1)),
  photos: S.optional(S.Array(PhotoInputValue)),
})

const VegetableVarietyInForm = S.extend(
  VegetableVariety,
  S.Struct({
    // When editing vegetables, existing varieties will include their current data in the DB
    inDb: S.optional(S.extend(VegetableVariety, S.Struct({ id: S.String }))),
  }),
)

export const Vegetable = S.Struct({
  names: S.Array(StringArrayInputValue).pipe(S.minItems(1)),
  handle: S.String.pipe(
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
  ),
  scientific_names: S.Array(StringArrayInputValue).pipe(S.minItems(1)),
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
  lifecycle: S.optional(
    S.Array(
      S.Literal(
        ...(Object.keys(VEGETABLE_LIFECYCLE_TO_LABEL) as VegetableLifecycle[]),
      ),
    ),
  ),
  stratum: S.Array(S.Literal(...(Object.keys(STRATUM_TO_LABEL) as Stratum[])))
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
  photos: S.optional(S.Array(PhotoInputValue)),
  content: LexicalEditorState,
})

export type VegetableVarietyDecoded = S.Schema.Type<typeof VegetableVariety>
export type VegetableDecoded = S.Schema.Type<typeof Vegetable>
