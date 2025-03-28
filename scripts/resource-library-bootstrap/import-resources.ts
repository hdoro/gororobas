import { Handle, RichText } from '@/schemas'
import { plainTextToTiptapJSON, tiptapJSONtoPlainText } from '@/utils/tiptap'
import { FileSystem, Path } from '@effect/platform'
import { Effect, Schema } from 'effect'
import { createClient } from 'gel'
import { glob } from 'glob'
import matter from 'gray-matter'
import { downloadResourceImage } from './download-resource-image'

const isProduction = !!process.env.EDGEDB_INSTANCE

const client = createClient({
  // Note: when developing locally you will need to set tls security to
  // insecure, because the development server uses self-signed certificates
  // which will cause api calls with the fetch api to fail.
  tlsSecurity: !isProduction ? 'insecure' : 'default',
  instanceName: process.env.EDGEDB_INSTANCE as string,
}).withConfig({
  apply_access_policies: false,
})

const TiptapJSONFromString = Schema.transform(Schema.String, RichText, {
  strict: true,
  decode: (str) => plainTextToTiptapJSON(str),
  encode: (json) => tiptapJSONtoPlainText(json),
})

export const TagMetadata = Schema.Struct({
  names: Schema.NonEmptyArray(Schema.String),
  description: Schema.NullishOr(TiptapJSONFromString),
  category: Schema.String,
})

export const ResourceMetadata = Schema.Struct({
  title: Schema.String,
  url: Schema.URL,
  format: Schema.Literal(
    'BOOK',
    'SOCIAL_MEDIA',
    'VIDEO',
    'ARTICLE',
    'PODCAST',
    'COURSE',
    'ACADEMIC_WORK',
    'DATASET',
    'ORGANIZATION',
    'OTHER',
  ),
  tags: Schema.NullishOr(Schema.Array(Schema.String)),
  description: Schema.NullishOr(TiptapJSONFromString),
  credit_line: Schema.NullishOr(Schema.String),
  related_vegetables: Schema.NullishOr(Schema.Array(Schema.String)),
  thumbnail: Schema.NullishOr(Schema.URL),
})

/**
 * Moves a file from inbox to processed folder
 */
function moveFileToProcessed(filePath: string) {
  return Effect.gen(function* () {
    const path = yield* Path.Path
    const fs = yield* FileSystem.FileSystem

    // Get the directory and filename
    const dirname = path.dirname(filePath)
    const filename = path.basename(filePath)

    // Replace 'inbox' with 'processed' in the directory path
    const processedDir = dirname.replace('/inbox/', '/processed/')

    // Create the processed directory if it doesn't exist
    yield* fs.makeDirectory(processedDir, { recursive: true })

    // Create the destination path
    const destPath = path.join(processedDir, filename)

    // Move the file
    yield* fs.rename(filePath, destPath)
  })
}

const getVegetablesSchema = Effect.gen(function* () {
  const vegetables = yield* Effect.tryPromise(() =>
    client.query<{ handle: string; names: string[] }>(
      `select Vegetable { handle, names }`,
    ),
  )
  return Schema.NullishOr(
    Schema.Array(
      Schema.Literal(...vegetables.map((v) => v.handle)).annotations({
        message: () => 'Invalid vegetable handle',
      }),
    ),
  )
})

// Function to process a single tag file
export function processTagFile(filePath: string) {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const fileContent = yield* fs.readFileString(filePath)
    const handle = yield* Schema.decode(Handle)(path.basename(filePath, '.md'))
    const metadata = yield* Schema.decodeUnknown(TagMetadata)(
      matter(fileContent).data,
    )
    return {
      ...metadata,
      handle,
    }
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError(`❌ Failed to process tag ${filePath}`, error),
    ),
  )
}

function addTag(filePath: string) {
  return Effect.gen(function* () {
    const tag = yield* processTagFile(filePath)

    // Insert tag into EdgeDB
    const query = `
      insert Tag {
        handle := <str>$handle,
        names := <array<str>>$names,
        description := <optional json>$description,
        category := <str>$category
      }
      unless conflict on .handle
      else (
        update Tag
        set {
          names := <array<str>>$names,
          description := <optional json>$description,
          category := <str>$category
        }
      );
    `

    yield* Effect.tryPromise(() => client.query(query, tag))

    yield* Effect.log(`✅ tag: ${tag.handle}`)

    // Move the file to processed folder
    if (isProduction) {
      yield* moveFileToProcessed(filePath)
    }

    return tag
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError(`❌ Failed to process tag ${filePath}`, error),
    ),
  )
}

// Function to process a single resource file
function processResourceFile(
  filePath: string,
  tagsSchema: Schema.SchemaClass<any, any, never>,
  vegetablesSchema: Schema.SchemaClass<any, any, never>,
) {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const fileContent = yield* fs.readFileString(filePath)
    const handle = yield* Schema.decode(Handle)(path.basename(filePath, '.md'))
    const metadata = yield* Schema.decodeUnknown(ResourceMetadata)(
      matter(fileContent).data,
    )

    // Ensures we can only add known tags
    yield* Schema.decodeUnknown(tagsSchema)(metadata.tags)

    // Ensures we can only add known vegetables
    yield* Schema.decodeUnknown(vegetablesSchema)(metadata.related_vegetables)

    const thumbnailImageSanityId = metadata.thumbnail
      ? yield* downloadResourceImage(metadata.thumbnail.toString())
      : undefined

    // Insert resource into EdgeDB
    const query = `
      with thumbnail_image := (
        insert Image {
          sanity_id := <optional str>$thumbnail,
          label := <str>$title
        }
        unless conflict on .sanity_id
        else (select Image filter .sanity_id = <str>$thumbnail)
      ) if exists <optional str>$thumbnail else {}
      insert Resource {
        title := <str>$title,
        url := <str>$url,
        format := <ResourceFormat>$format,
        handle := <str>$handle,
        description := <optional json>$description,
        credit_line := <optional str>$credit_line,
        thumbnail := thumbnail_image,
        tags := (
          select Tag
          filter .handle in array_unpack(<array<str>>$tags)
        ),
        related_vegetables := (
          select Vegetable
          filter .handle in array_unpack(<array<str>>$related_vegetables)
        )
      }
    `

    const params = {
      ...metadata,
      url: metadata.url.toString(),
      related_vegetables: metadata.related_vegetables || [],
      tags: metadata.tags || [],
      thumbnail: thumbnailImageSanityId?.sanity_id,
      handle,
    }
    yield* Effect.logDebug(`💡 Resource insert params:`, params)
    yield* Effect.tryPromise(() => client.query(query, params))

    yield* Effect.log(`✅ Imported resource: ${metadata.title}`)

    // Move the file to processed folder
    if (isProduction) {
      yield* moveFileToProcessed(filePath)
    }
  }).pipe(
    Effect.tapError((error) =>
      Effect.logError(`❌ Failed to process resource ${filePath}`, error),
    ),
  )
}

// Main function to import tags and resources
export const importTagsAndResources = Effect.gen(function* () {
  // Clear resources and tags in development
  if (!isProduction) {
    yield* Effect.tryPromise(() =>
      client.query(`
        delete Tag;
        delete Resource;
      `),
    )
  }

  // TAGS
  const tagFiles = yield* Effect.tryPromise(() =>
    glob('scripts/resource-library-bootstrap/tags/inbox/**/*.md'),
  )
  yield* Effect.log(`Found ${tagFiles.length} tags to import.`)
  const tags = yield* Effect.all(tagFiles.map(addTag), {
    concurrency: 20,
  })
  yield* Effect.log(`\n✨ ${tagFiles.length} tags imported`)

  const TagsSchema = Schema.NullishOr(
    Schema.Array(
      Schema.Literal(...tags.map((tag) => tag.handle)).annotations({
        message: () => 'Invalid tag handle',
      }),
    ),
  )
  const VegetablesSchema = yield* getVegetablesSchema

  // RESOURCES
  const resourceFiles = yield* Effect.tryPromise(() =>
    glob('scripts/resource-library-bootstrap/resources/inbox/**/*.md'),
  )
  yield* Effect.log(`Found ${resourceFiles.length} resources to import.`)
  yield* Effect.all(
    resourceFiles.map((file) =>
      processResourceFile(file, TagsSchema, VegetablesSchema),
    ),
    {
      concurrency: 10,
    },
  )
  yield* Effect.log(`\n✨ ${resourceFiles.length} resources imported`)
})
