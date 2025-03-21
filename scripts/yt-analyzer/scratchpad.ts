import { getYouTubeID } from '@/utils/youtube'
import { youtube_v3 } from '@googleapis/youtube'
import { YoutubeTranscript } from 'youtube-transcript'

/**
 * Reference for `analyze-videos`
 */
async function getVideoInfo(videoUrl: string) {
  try {
    // Extract video ID from URL
    const videoId = getYouTubeID(videoUrl)
    if (!videoId) {
      throw new Error('Invalid YouTube URL')
    }

    // Create YouTube client with API key authentication
    const youtube = new youtube_v3.Youtube({
      auth: process.env.GOOGLE_DATA_API_KEY as string,
    })

    // Get video details
    const response = await youtube.videos.list({
      part: ['snippet', 'topicDetails', 'statistics'],
      id: [videoId],
    })

    // Check if video exists
    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found')
    }

    const video = response.data.items[0]
    const { title, description, channelId, channelTitle } = video.snippet || {}

    console.log('Video Title:', title)
    console.log('Description:', description)
    console.log('Channel:', channelTitle)
    console.log('Channel ID:', channelId)

    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId)
    console.log(transcriptData)
    // const captionsRes = await youtube.captions.list({
    //   videoId,
    //   part: ['snippet'],
    // })
    // if (!captionsRes.data.items || captionsRes.data.items.length === 0) {
    //   throw new Error('Captions not found')
    // }

    // const captions = captionsRes.data.items[0]
    // if (!captions.id) {
    //   throw new Error('Captions ID not found')
    // }
    // console.log('Captions:', captions)

    // const captionsData = await youtube.captions.download({ id: captions.id })
    // console.log('Captions data:', captionsData)

    // if (captions) {
    //   captions.
    // }

    return video
  } catch (error) {
    console.error('Error fetching video info:', error)
    throw error
  }
}

// Example usage
getVideoInfo('https://www.youtube.com/watch?v=S1YKKpLR7XI')
  .then((videoInfo) => {
    // console.log('Full video info:', videoInfo)
  })
  .catch((err) => {
    console.error('Error:', err.message)
  })
