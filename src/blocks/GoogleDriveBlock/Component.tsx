import React from 'react'

function getDriveEmbedUrl(url: string): string | null {
  // Convert https://drive.google.com/file/d/FILE_ID/view to embed URL
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
  // Handle /open?id= format
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/preview`
  return null
}

type GoogleDriveBlockProps = {
  driveLink: string
  title?: string | null
  showPreview?: boolean | null
  id?: string
}

export const GoogleDriveBlockComponent: React.FC<GoogleDriveBlockProps> = ({
  driveLink,
  title,
  showPreview,
}) => {
  if (!driveLink) return null
  const embedUrl = getDriveEmbedUrl(driveLink)
  return (
    <div className="my-8">
      {title && <h3 className="mb-4 text-xl font-semibold">{title}</h3>}
      {showPreview && embedUrl ? (
        <div
          className="relative w-full overflow-hidden rounded-lg border border-gray-200"
          style={{ paddingTop: '141.4%' }}
        >
          <iframe
            src={embedUrl}
            className="absolute inset-0 h-full w-full"
            allow="autoplay"
            title={title || 'Google Drive file'}
          />
        </div>
      ) : (
        <a
          href={driveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          파일 열기
        </a>
      )}
    </div>
  )
}
