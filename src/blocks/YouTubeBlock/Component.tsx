import React from 'react'

type YouTubeBlockProps = {
  videoId: string
  title?: string | null
  id?: string
}

export const YouTubeBlockComponent: React.FC<YouTubeBlockProps> = ({ videoId, title }) => {
  if (!videoId) return null
  return (
    <div className="my-8">
      {title && <h3 className="mb-4 text-xl font-semibold">{title}</h3>}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          data-analytics-content-id={`youtube_${videoId}`}
          data-analytics-content-type="youtube_block"
          data-analytics-embed="youtube"
          data-youtube-video-id={videoId}
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1`}
          title={title || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  )
}
