/**
 * Adaptation of Tiptap's official YouTube extension
 * https://github.com/ueberdosis/tiptap/blob/develop/packages/extension-youtube/src/youtube.ts
 *
 * Major changes:
 * - different data structure - store `id` instead of full URL
 * - proper UI for inputting the video URL (as opposed to an `alert`) - see VideoEditor
 * - disable rendering options, save only the URL / ID (width, height, etc.)
 * - eventually could include other videos
 */

import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { Schema } from 'effect'
import { m } from '@/paraglide/messages'
import {
  RichTextVideoAttributes,
  type RichTextVideoAttributesInDB,
  YOUTUBE_REGEX,
  type YoutubeVideoIdType,
  YoutubeVideoURL,
} from '@/schemas'
import { getYoutubeVideoURL } from '@/utils/youtube'
import { getVideoTiptapContent } from './VideoEditor'

export type VideoOptions<
  SuggestionItem = any,
  Attrs extends Record<string, any> = RichTextVideoAttributesInDB,
> = {
  /**
   * The HTML attributes for a video node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

export const VideoPluginKey = new PluginKey('video')

export const Video = Node.create<VideoOptions>({
  name: 'video',

  group: 'block',

  inline: false,

  selectable: true,

  atom: true,

  addAttributes() {
    return {
      data: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-video-data'),
        renderHTML: (attributes) => {
          if (!attributes.data) {
            return {}
          }

          return {
            'data-video-data': attributes.data,
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
      const { data } = Schema.encodeUnknownSync(RichTextVideoAttributes)(
        node.attrs,
      )

      return [
        'div',
        mergeAttributes(
          { class: 'my-6 tiptap--video' },
          this.options.HTMLAttributes,
        ),
        [
          'iframe',
          {
            src: `https://www.youtube.com/embed/${data.id}`,
            allow:
              'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowFullScreen: true,
            width: '100%',
            height: 'auto',
            style: 'aspect-ratio: 16/9',
          },
        ],
      ]
    } catch (_error) {
      return ['div']
    }
  },

  renderText({ node }) {
    try {
      const { data } = Schema.encodeUnknownSync(RichTextVideoAttributes)(
        node.attrs,
      )
      return getYoutubeVideoURL(data.id as YoutubeVideoIdType)
    } catch (_error) {
      return m.large_awake_hyena_arise()
    }
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: YOUTUBE_REGEX,
        type: this.type,
        getAttributes: (match) => {
          try {
            const url = Schema.decodeUnknownSync(YoutubeVideoURL)(match.input)
            return { data: getVideoTiptapContent(url).attrs.data }
          } catch (_error) {
            return null
          }
        },
      }),
    ]
  },
})
