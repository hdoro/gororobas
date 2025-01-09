import {
  RichTextImageAttributes,
  type RichTextImageAttributesInDB,
} from '@/schemas'
import { getImageProps } from '@/utils/getImageProps'
import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { Schema } from 'effect'

export const inputRegex =
  /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/

export type ImageOptions<
  SuggestionItem = any,
  Attrs extends Record<string, any> = RichTextImageAttributesInDB,
> = {
  /**
   * The HTML attributes for a image node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

export const ImagePluginKey = new PluginKey('image')

export const Image = Node.create<ImageOptions>({
  name: 'image',

  group: 'block',

  inline: false,

  selectable: true,

  atom: true,

  addAttributes() {
    return {
      data: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-image-data'),
        renderHTML: (attributes) => {
          if (!attributes.data) {
            return {}
          }

          return {
            'data-image-data': attributes.data,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`,
      },
    ]
  },

  renderHTML({ node }) {
    try {
      const {
        data: { image },
      } = Schema.encodeUnknownSync(RichTextImageAttributes)(node.attrs)

      const imageProps = getImageProps({ image, maxWidth: 560 }) || null

      if (!imageProps?.src) throw new Error('invalid-image-render-fallback')

      return [
        'div',
        mergeAttributes(
          { class: 'my-6 tiptap--image' },
          this.options.HTMLAttributes,
        ),
        ['img', imageProps],
      ]
    } catch (error) {
      return ['div']
    }
  },

  renderText() {
    return 'imagem'
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match, ...props) => {
          console.log({ match, props })
          const [, , alt, src, title] = match

          return { src, alt, title }
        },
      }),
    ]
  },
})
