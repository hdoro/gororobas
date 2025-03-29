import { Handle } from '@/schemas'
import { removeNullishKeys } from '@/utils/diffs'
import { FileSystem, Path } from '@effect/platform'
import { Effect, Schema } from 'effect'
import matter from 'gray-matter'
import type { ResourceMetadata } from '../resource-library-bootstrap/import-resources'

export type ResourceToInboxParams = Omit<
  typeof ResourceMetadata.Type,
  'description' | 'thumbnail' | 'url'
> & {
  description: string
  thumbnail: string
  url: string
  handle: string
  inboxFolder: string
  content?: string
}

export type ResourceCustomizer = (
  resource: ResourceToInboxParams,
) => ResourceToInboxParams

export const addResourceToInbox = ({
  customizer,
  ...rawInput
}: ResourceToInboxParams & {
  customizer?: ResourceCustomizer | undefined
}) =>
  Effect.gen(function* () {
    const input = customizer ? customizer(rawInput) : rawInput
    const { content = '', handle, inboxFolder, ...metadata } = input
    yield* Schema.decode(Handle)(handle)

    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    yield* fs.makeDirectory(inboxFolder, { recursive: true })

    const filePath = path.join(inboxFolder, `${handle}.md`)
    yield* Effect.logDebug(`Adding resource to ${filePath}`, metadata)
    const markdownFile = matter.stringify(
      content,
      removeNullishKeys({
        ...metadata,
        description: metadata.description?.trim(),
        title: metadata.title?.trim(),
        credit_line: metadata.credit_line?.trim(),
      }),
    )
    yield* fs.writeFileString(filePath, markdownFile)

    return filePath
  })
