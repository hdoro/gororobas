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
  NOTE_PUBLISH_STATUS_TO_LABEL,
  NOTE_TYPE_TO_LABEL,
  PLANTING_METHOD_TO_LABEL,
  STRATUM_TO_LABEL,
  TIP_SUBJECT_TO_LABEL,
  USAGE_TO_LABEL,
  VEGETABLE_LIFECYCLE_TO_LABEL,
} from '@/utils/labels'
import { MAX_ACCEPTED_HEIGHT } from '@/utils/numbers'
import type { JSONContent } from '@tiptap/react'
import { Effect, ParseResult, Schema as S } from 'effect'
import type { NotePublishStatus, NoteType } from './edgedb.interfaces'
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
  S.declare(isTipTapJSON).annotations({ message: () => 'Conteúdo inválido' }),
  S.declare(isTipTapJSON).annotations({ message: () => 'Conteúdo inválido' }),
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
  userIds: S.NonEmptyArray(S.UUID).annotations({
    message: () => 'Escolha ao menos uma pessoa para creditar',
  }),
})

const SourceExternalInForm = S.Struct({
  id: S.UUID,
  comments: Optional(RichText),
  type: S.Literal('EXTERNAL' satisfies SourceType),
  credits: S.String.pipe(
    S.annotations({
      message: () => 'Obrigatório',
    }),
    S.minLength(3, {
      message: () => 'Obrigatório (ao menos 3 caracteres)',
    }),
  ),
  origin: Optional(S.String),
})

export const SourceInForm = S.Union(SourceGororobasInForm, SourceExternalInForm)

export const NewImageDataInForm = S.Struct({
  file: FileSchema.pipe(
    S.annotations({
      message: () => 'Imagem inválida',
    }),
  ),
})

export const StoredImageDataInForm = S.Struct({
  sanity_id: S.String,
  hotspot: Optional(S.Object),
  crop: Optional(S.Object),
})

const ImageMetadata = S.Struct({
  id: S.UUID,
  label: Optional(S.String),
  sources: Optional(S.Array(SourceInForm)),
})

export const ImageInForm = ImageMetadata.pipe(
  S.extend(S.Union(NewImageDataInForm, StoredImageDataInForm)),
)

export const NewImageInForm = ImageMetadata.pipe(S.extend(NewImageDataInForm))
export type NewImageData = typeof NewImageInForm.Type

export const StoredImageInForm = ImageMetadata.pipe(
  S.extend(StoredImageDataInForm),
)
/** What gets stored as an `Image` Object in EdgeDB */
export const ImageObjectInDB = StoredImageInForm
export type StoredImageInFormType = typeof StoredImageInForm.Type

/**
 * encoded: form;
 * decoded: DB;
 */
export const ImageFormToDBTransformer = S.transformOrFail(
  ImageInForm,
  ImageObjectInDB,
  {
    strict: true,
    encode: (imageInDB) => ParseResult.succeed(imageInDB),
    decode: (imageInForm, _, ast) =>
      Effect.gen(function* (_) {
        if (S.is(StoredImageInForm)(imageInForm)) {
          return imageInForm
        }

        const formData = new FormData()
        formData.append('file', imageInForm.file)
        const result = yield* _(
          Effect.tryPromise({
            try: () =>
              fetch('/api/images', {
                method: 'POST',
                body: formData,
              }).then((response) => response.json()),
            catch: (error) =>
              new FailedUploadingImageError(error, imageInForm.file),
          }),
        )

        if (
          !result ||
          'error' in result ||
          !('sanity_id' in result) ||
          typeof result.sanity_id !== 'string'
        ) {
          return yield* Effect.fail(
            new FailedUploadingImageError(result.error, imageInForm.file),
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

const Name = S.String.pipe(
  S.minLength(3, {
    message: () => 'Nomes precisam de ao menos 3 caracteres',
  }),
  S.maxLength(60, {
    message: () => 'Nomes não podem ir além de 60 caracteres',
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

export const VegetableTipData = S.Struct({
  /** Only exists for tips that are already in DB */
  id: Optional(S.UUID),
  handle: Optional(Handle),
  subjects: S.NonEmptyArray(
    S.Literal(...(Object.keys(TIP_SUBJECT_TO_LABEL) as TipSubject[])),
  ).annotations({
    message: () => 'Escolha ao menos um assunto',
  }),
  content: RichText,
  sources: Optional(S.Array(SourceInForm)),
})

export type VegetableTipForDB = typeof VegetableTipData.Type
export type VegetableTipInForm = typeof VegetableTipData.Encoded

const Height = S.Int.pipe(
  S.positive({ message: () => 'Altura deve ser um número positivo' }),
  S.lessThan(MAX_ACCEPTED_HEIGHT, {
    message: () => 'Que vegetal gigante e louco é esse?!',
  }),
)

export const MAX_ACCEPTED_TEMPERATURE = 50
export const MIN_ACCEPTED_TEMPERATURE = -50
const Temperature = S.Int.pipe(
  S.greaterThan(MIN_ACCEPTED_TEMPERATURE, {
    message: () => 'Que inverno gelado é esse que cê tá plantando?!',
  }),
  S.lessThan(MAX_ACCEPTED_TEMPERATURE, {
    message: () => 'Que verão quente é esse que cê tá plantando?!',
  }),
)

const DevelopmentCycleDays = S.Int.pipe(
  S.greaterThan(5, {
    message: () => 'Que vegetal de crescimento supersônico é esse?! 😱',
  }),
  S.lessThan(1095, {
    message: () =>
      'Se leva mais de 3 anos para crescer, é um vegetal perene e não deveria ter esse campo preenchido',
  }),
)

const VegetableCoreData = S.Struct({
  id: S.UUID,
  names: S.NonEmptyArray(NameInArray),
  handle: Handle,
  scientific_names: Optional(S.Array(NameInArray)),
  origin: Optional(
    S.String.pipe(
      S.maxLength(60, {
        message: () => 'A origem tem de ser menor que 60 caracteres',
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
  development_cycle_min: Optional(DevelopmentCycleDays),
  development_cycle_max: Optional(DevelopmentCycleDays),
  height_min: Optional(Height),
  height_max: Optional(Height),
  temperature_min: Optional(Temperature),
  temperature_max: Optional(Temperature),
  content: Optional(RichText),
  friends: Optional(S.Array(S.UUID)),
  varieties: Optional(S.Array(VegetableVarietyData)),
  photos: Optional(S.Array(ImageInForm)),
  sources: Optional(S.Array(SourceInForm)),
})

export const VegetableData = VegetableCoreData.pipe(
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

export type VegetableForDB = typeof VegetableData.Type
export type VegetableInForm = typeof VegetableData.Encoded

export const VegetableWithUploadedImages = S.Struct({
  ...VegetableCoreData.fields,
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
})

export type VegetableForDBWithImages = typeof VegetableWithUploadedImages.Type
export type VegetableVarietyForDBWithImages = Exclude<
  VegetableForDBWithImages['varieties'],
  null | undefined
>[number]

export type SourceForDB = typeof SourceInForm.Type

export const ProfileData = S.Struct({
  id: S.UUID,
  handle: Handle,
  name: Name,
  photo: Optional(S.partial(ImageInForm)),
  location: Optional(S.String),
  bio: Optional(RichText),
})

export type ProfileDataForDB = typeof ProfileData.Type
export type ProfileDataInForm = typeof ProfileData.Encoded

/** Profiles can be partially updated. Photo should be sent to the DB first. */
export const ProfileDataWithImage = S.partial(
  ProfileData.pipe(S.omit('id', 'photo')),
).pipe(
  S.extend(ProfileData.pipe(S.pick('id'))),
  S.extend(
    S.Struct({
      photo: Optional(ImageFormToDBTransformer),
    }),
  ),
)

// gender: Optional(S.Literal(...(Object.keys(GENDER_TO_LABEL) as Gender[]))),

const NotePublishStatusLiteral = Optional(S.Literal(...(Object.keys(NOTE_PUBLISH_STATUS_TO_LABEL) as NotePublishStatus[])));

export const NoteData = S.Struct({
  id: S.UUID,
  published_at: S.Union(S.Date, S.DateFromSelf),
  title: RichText,
  body: Optional(RichText),
  public: Optional(S.Boolean),
  publish_status: NotePublishStatusLiteral,
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

const RangeBoundValue = S.NullishOr(S.Int)
/** [min, max] */
export const RangeFormValue = S.Tuple(RangeBoundValue, RangeBoundValue)
