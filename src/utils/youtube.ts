import type { YoutubeIdType, YoutubeURLType } from '@/schemas'

export function getYouTubeID<U extends string | YoutubeURLType>(
  url: U,
  opts: { fuzzy?: boolean } = { fuzzy: true },
): U extends YoutubeURLType ? YoutubeIdType : YoutubeIdType | null {
  if (/youtu\.?be/.test(url)) {
    // Look first for known patterns
    const patterns = [
      /youtu\.be\/([^#\&\?]{11})/, // youtu.be/<id>
      /\?v=([^#\&\?]{11})/, // ?v=<id>
      /\&v=([^#\&\?]{11})/, // &v=<id>
      /embed\/([^#\&\?]{11})/, // embed/<id>
      /\/v\/([^#\&\?]{11})/, // /v/<id>
    ]

    // If any pattern matches, return the ID
    for (const pattern of patterns) {
      const match = pattern.exec(url)
      if (match) {
        return match[1] as YoutubeIdType
      }
    }

    if (opts.fuzzy) {
      // If that fails, break it apart by certain characters and look
      // for the 11 character key
      const tokens = url.split(/[\/\&\?=#\.\s]/g)
      for (const token of tokens) {
        if (/^[^#\&\?]{11}$/.test(token)) {
          return token as YoutubeIdType
        }
      }
    }
  }

  return null as U extends YoutubeURLType ? YoutubeIdType : YoutubeIdType | null
}

export function getYoutubeVideoURL(id: YoutubeIdType) {
  return `https://www.youtube.com/watch?v=${id}`
}
