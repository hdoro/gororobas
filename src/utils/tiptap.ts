import { richTextEditorTheme } from '@/components/RichTextEditor/RichTextEditor.theme'
import { getTiptapExtensions } from '@/components/RichTextEditor/getTiptapExtensions'
import { RichText } from '@/schemas'
import type { TiptapNode } from '@/types'
import { generateText } from '@tiptap/core'
import { Schema } from 'effect'

export function tiptapJSONtoPlainText(json: TiptapNode) {
  try {
    const extensions = getTiptapExtensions({ classes: richTextEditorTheme() })
    return generateText(json, extensions, {
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
    return undefined
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
