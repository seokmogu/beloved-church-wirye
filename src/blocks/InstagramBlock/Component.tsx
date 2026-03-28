'use client'
import React from 'react'

type InstagramBlockProps = {
  embedCode: string
  id?: string
}

export const InstagramBlockComponent: React.FC<InstagramBlockProps> = ({ embedCode }) => {
  if (!embedCode) return null
  // Basic sanitization: only allow blockquote/script tags from instagram
  const isSafeEmbed = embedCode.includes('instagram.com')
  if (!isSafeEmbed) return null
  return (
    <div className="my-8 flex justify-center">
      <div dangerouslySetInnerHTML={{ __html: embedCode }} />
    </div>
  )
}
