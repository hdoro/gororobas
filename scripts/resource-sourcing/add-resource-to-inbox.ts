import { Handle } from '@/schemas'
import { removeNullishKeys } from '@/utils/diffs'
import { FileSystem, Path } from '@effect/platform'
import { Effect, Schema } from 'effect'
import matter from 'gray-matter'
import type { ResourceMetadata } from '../resource-library-bootstrap/import-resources'

export const addResourceToInbox = ({
  content = '',
  handle,
  inboxFolder,
  ...metadata
}: Omit<typeof ResourceMetadata.Type, 'description' | 'thumbnail' | 'url'> & {
  description: string
  thumbnail: string
  url: string
  handle: string
  inboxFolder: string
  content?: string
}) =>
  Effect.gen(function* () {
    yield* Schema.decode(Handle)(handle)

    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    yield* fs.makeDirectory(inboxFolder, { recursive: true })

    const markdownFile = matter.stringify(content, removeNullishKeys(metadata))
    const filePath = path.join(inboxFolder, `${handle}.md`)
    yield* fs.writeFileString(filePath, markdownFile)
  })
