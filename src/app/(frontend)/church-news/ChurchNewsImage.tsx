'use client'

import Image, { type ImageProps } from 'next/image'
import { useEffect, useState } from 'react'

type ChurchNewsImageProps = Omit<ImageProps, 'src'> & {
  fallbackSrc?: string
  src: string
}

export function ChurchNewsImage({ alt, fallbackSrc, onError, src, ...props }: ChurchNewsImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)

  useEffect(() => {
    setCurrentSrc(src)
  }, [src])

  return (
    <Image
      {...props}
      alt={alt}
      onError={(event) => {
        if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc)
        onError?.(event)
      }}
      src={currentSrc}
    />
  )
}
