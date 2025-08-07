import type { YoutubeVideoIdType, YoutubeVideoURLType } from '@/schemas'

export function getYouTubeID<U extends string | YoutubeVideoURLType>(
  url: U,
  opts: { fuzzy?: boolean } = { fuzzy: true },
): U extends YoutubeVideoURLType
  ? YoutubeVideoIdType
  : YoutubeVideoIdType | null {
  if (/youtu\.?be/.test(url)) {
    // Look first for known patterns
    const patterns = [
      /youtu\.be\/([^#&?]{11})/, // youtu.be/<id>
      /\?v=([^#&?]{11})/, // ?v=<id>
      /&v=([^#&?]{11})/, // &v=<id>
      /embed\/([^#&?]{11})/, // embed/<id>
      /\/v\/([^#&?]{11})/, // /v/<id>
    ]

    // If any pattern matches, return the ID
    for (const pattern of patterns) {
      const match = pattern.exec(url)
      if (match) {
        return match[1] as YoutubeVideoIdType
      }
    }

    if (opts.fuzzy) {
      // If that fails, break it apart by certain characters and look
      // for the 11 character key
      const tokens = url.split(/[/&?=#.\s]/g)
      for (const token of tokens) {
        if (/^[^#&?]{11}$/.test(token)) {
          return token as YoutubeVideoIdType
        }
      }
    }
  }

  return null as U extends YoutubeVideoURLType
    ? YoutubeVideoIdType
    : YoutubeVideoIdType | null
}

export function getYoutubeVideoURL(id: YoutubeVideoIdType) {
  return `https://www.youtube.com/watch?v=${id}`
}
