import type { ResourceFormat } from '@/gel.interfaces'
import { slugify } from '@/utils/strings'
import { plainTextToTiptapJSON } from '@/utils/tiptap'
import fs from 'fs'
import { createClient } from 'gel'
import { glob } from 'glob'
import matter from 'gray-matter'
import path from 'path'

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

// Interface for tag data
interface TagData {
  handle: string
  names: string[]
  description?: string | undefined
  category: string
}

// Interface for resource data
interface ResourceData {
  title: string
  url: string
  format: ResourceFormat
  handle?: string
  tags?: string[]
  description?: string | undefined
  credit_line?: string
  related_vegetables?: string[]
  content: string
  thumbnail?: string
}

/**
 * Moves a file from inbox to processed folder
 */
function moveFileToProcessed(filePath: string): void {
  try {
    // Get the directory and filename
    const dirname = path.dirname(filePath)
    const filename = path.basename(filePath)

    // Replace 'inbox' with 'processed' in the directory path
    const processedDir = dirname.replace('/inbox/', '/processed/')

    // Create the processed directory if it doesn't exist
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true })
    }

    // Create the destination path
    const destPath = path.join(processedDir, filename)

    // Move the file
    fs.renameSync(filePath, destPath)

    console.log(`Moved ${filePath} to ${destPath}`)
  } catch (error) {
    console.error(`Error moving file ${filePath} to processed:`, error)
  }
}

// Function to process a single tag file
async function processTagFile(filePath: string): Promise<void> {
  try {
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(fileContent)

    // Prepare tag data
    const tagData: TagData = {
      handle: data.handle,
      names: data.names,
      description: data.description
        ? JSON.stringify(plainTextToTiptapJSON(data.description))
        : undefined,
      category: data.category,
    }

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

    await client.query(query, {
      handle: tagData.handle,
      names: tagData.names,
      description: tagData.description,
      category: tagData.category,
    })

    console.log(`✅ Imported tag: ${tagData.handle}`)

    // Move the file to processed folder
    if (isProduction) {
      moveFileToProcessed(filePath)
    }
  } catch (error) {
    console.error(`❌ Error processing tag ${filePath}:`, error)
  }
}

function parseContent(content?: string) {
  if (!content) return undefined

  const trimmed = content.trim()
  if (!trimmed || !trimmed.replace(/\n/g, '')) {
    return undefined
  }

  if (trimmed.match('WEBVTT')) {
    return JSON.stringify({ type: 'webvtt', content: trimmed })
  }

  return JSON.stringify({ type: 'markdown', content: trimmed })
}

// Function to process a single resource file
async function processResourceFile(filePath: string): Promise<void> {
  try {
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    // Generate handle if not provided
    if (!data.handle) {
      data.handle = slugify(data.title)
    }

    // Prepare resource data
    const resourceData: ResourceData = {
      title: data.title,
      url: data.url,
      format: data.format,
      handle: data.handle,
      tags: data.tags || [],
      description: data.description
        ? JSON.stringify(plainTextToTiptapJSON(data.description))
        : undefined,
      credit_line: data.credit_line,
      related_vegetables: data.related_vegetables || [],
      content: JSON.stringify(parseContent(content)),
      thumbnail: data.thumbnail,
    }

    // Insert resource into EdgeDB
    const query = `
      insert Resource {
        title := <str>$title,
        url := <str>$url,
        format := <ResourceFormat>$format,
        handle := <str>$handle,
        description := <optional json>$description,
        credit_line := <optional str>$credit_line,
        content := <optional json>$content,
        thumbnail := <optional str>$thumbnail,
        tags := (
          select Tag
          filter .handle in array_unpack(<array<str>>$tags)
        ),
        related_to_vegetables := (
          select Vegetable
          filter .handle in array_unpack(<array<str>>$related_vegetables)
        )
      }
    `

    await client.query(query, { ...resourceData })

    console.log(`✅ Imported resource: ${data.title}`)

    // Move the file to processed folder
    if (isProduction) {
      moveFileToProcessed(filePath)
    }
  } catch (error) {
    console.error(`❌ Error processing resource ${filePath}:`, error)
  }
}

// Main function to import tags and resources
async function importTagsAndResources() {
  // Clear resources and tags in development
  if (!isProduction) {
    await client.query(`delete Tag`)
    await client.query(`delete Resource`)
  }

  try {
    // First import tags
    const tagFiles = await glob(
      'scripts/resource-library-bootstrap/tags/inbox/**/*.md',
      {
        ignore: ['scripts/resource-library-bootstrap/tags/template.md'],
      },
    )

    console.log(`Found ${tagFiles.length} tag files to import.`)

    for (const file of tagFiles) {
      await processTagFile(file)
    }

    console.log('Tag import completed!')

    // Then import resources
    const resourceFiles = await glob(
      'scripts/resource-library-bootstrap/resources/inbox/**/*.md',
      {
        ignore: ['scripts/resource-library-bootstrap/resources/template.md'],
      },
    )

    console.log(`Found ${resourceFiles.length} resource files to import.`)

    for (const file of resourceFiles) {
      await processResourceFile(file)
    }

    console.log('Resource import completed!')
  } catch (error) {
    console.error('Error importing tags and resources:', error)
  } finally {
    client.close()
  }
}

// Run the import
importTagsAndResources()
