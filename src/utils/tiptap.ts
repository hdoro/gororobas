import { richTextEditorTheme } from '@/components/RichTextEditor/RichTextEditor.theme'
import { getTiptapExtensions } from '@/components/RichTextEditor/getTiptapExtensions'
import { RichText, type RichTextValue } from '@/schemas'
import type { TiptapNode } from '@/types'
import { generateText } from '@tiptap/core'
import { Schema } from 'effect'

function removeEmptyTextNodes(json: TiptapNode): TiptapNode {
  if (!json.content) return json

  return {
    ...json,
    content: json.content.flatMap((node) => {
      if (node.type === 'text' && !node.text) return []

      return [removeEmptyTextNodes(node)]
    }),
  }
}

export function tiptapJSONtoPlainText(json: TiptapNode) {
  try {
    const extensions = getTiptapExtensions({ classes: richTextEditorTheme() })
    return generateText(removeEmptyTextNodes(json), extensions, {
      // @TODO: add a prefix to list items - currently `generateText` from the list item node doesn't work
      // textSerializers: {
      //   listItem: (props) => {
      //     let text = 'a'
      //     try {
      //       text = generateText([props.node], extensions)
      //     } catch (error) {
      //     }
      //     const prefix =
      //       props.parent.type.name === 'bulletList'
      //         ? '- '
      //         : `${props.index + 1}. `
      //     return `${prefix} ${text}`
      //   },
      // },
    })
  } catch (error) {
    return JSON.stringify(json)
  }
}

export function isRenderableRichText(
  json: unknown,
): json is typeof RichText.Type {
  return (
    // Must be a TipTap object
    Schema.is(RichText)(json) &&
    // Of at least one element
    !!json.content &&
    (json.content.length > 1 ||
      // Which is either not a paragraph
      json.content[0].type !== 'paragraph' ||
      // Or has some text
      !!tiptapJSONtoPlainText(json))
  )
}

export function plainTextToTiptapJSON(text: string): RichTextValue {
  return {
    type: 'doc',
    version: 1,
    content: [
      ...text
        .replace(/\n{2,}/g, '\n')
        .split('\n')
        .map((line) => ({
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: line,
            },
          ],
        })),
    ],
  }
}

export function truncateTiptapContent(
  json: TiptapNode,
  maxLength: number,
): TiptapNode {
  if (!json.content) return json

  return {
    ...json,
    content: json.content.slice(0, maxLength),
  }
}
