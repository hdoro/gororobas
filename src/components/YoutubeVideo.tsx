import type { YoutubeVideoIdType } from '@/schemas'

export default function YoutubeVideo(props: { id: YoutubeVideoIdType }) {
  return (
    <div className="my-6">
      <iframe
        title="Vídeo no YouTube"
        src={`https://www.youtube-nocookie.com/embed/${props.id}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        width="100%"
        height="auto"
        style={{ aspectRatio: '16/9' }}
      />
    </div>
  )
}
