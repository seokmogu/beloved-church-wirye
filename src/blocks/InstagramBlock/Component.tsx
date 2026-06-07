'use client'
import React from 'react'

type InstagramBlockProps = {
  embedCode: string
  id?: string
}

// Pull the post permalink out of whatever the editor pasted (the share>embed snippet
// always contains an instagram.com/p|reel|tv/<shortcode> link).
function toInstagramEmbedSrc(embedCode: string): string | null {
  const match = embedCode.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/)
  if (!match) return null
  return `https://www.instagram.com/${match[1]}/${match[2]}/embed`
}

export const InstagramBlockComponent: React.FC<InstagramBlockProps> = ({ embedCode }) => {
  if (!embedCode) return null

  // Never inject the pasted markup as raw HTML (the previous `includes('instagram.com')`
  // check was not sanitization and allowed stored XSS). Instead render Instagram's own
  // sandboxed embed iframe built from the extracted permalink — no untrusted HTML at all.
  const src = toInstagramEmbedSrc(embedCode)
  if (!src) return null

  return (
    <div className="my-8 flex justify-center">
      <iframe
        allowTransparency
        className="w-full max-w-[540px]"
        loading="lazy"
        scrolling="no"
        src={src}
        style={{ border: 'none', height: 680, overflow: 'hidden' }}
        title="Instagram 게시물"
      />
    </div>
  )
}
