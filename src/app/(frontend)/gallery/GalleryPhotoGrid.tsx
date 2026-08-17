'use client'

import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export type GalleryPhoto = {
  alt: string
  caption?: string | null
  cardSrc: string
  displaySrc: string
}

export function GalleryPhotoGrid({ images, title }: { images: GalleryPhoto[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const activeImage = activeIndex === null ? null : images[activeIndex]

  useEffect(() => {
    if (activeIndex === null) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowLeft') setActiveIndex((current) => moveIndex(current, -1, images.length))
      if (event.key === 'ArrowRight') setActiveIndex((current) => moveIndex(current, 1, images.length))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, images.length])

  if (!images.length) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 text-center text-sm text-muted-foreground">
        공개할 사진을 준비하고 있습니다.
      </div>
    )
  }

  return (
    <>
      <section aria-label={`${title} 사진`} className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <button
            aria-label={`${title} ${index + 1}번째 사진 크게 보기`}
            className="group relative aspect-square overflow-hidden rounded-xl bg-muted text-left outline-offset-4 transition focus-visible:outline-2 focus-visible:outline-primary"
            key={`${image.cardSrc}-${index}`}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- R2 already serves responsive gallery derivatives directly. */}
            <img
              alt={image.alt}
              className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
              loading={index < 4 ? 'eager' : 'lazy'}
              src={image.cardSrc}
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent px-3 pb-2 pt-8 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {index + 1} / {images.length}
            </span>
          </button>
        ))}
      </section>

      {activeImage !== null && activeIndex !== null ? (
        <div
          aria-label="사진 크게 보기"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-8"
          role="dialog"
        >
          <button
            aria-label="사진 크게 보기 닫기"
            className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white sm:right-6 sm:top-6"
            onClick={() => setActiveIndex(null)}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>

          <div className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- The full-size R2 derivative is only requested after a user opens it. */}
            <img
              alt={activeImage.alt}
              className="max-h-[calc(100dvh-8.5rem)] max-w-full rounded-md object-contain shadow-2xl"
              src={activeImage.displaySrc}
            />
            <div className="mt-3 flex w-full max-w-3xl items-center justify-between gap-4 px-1 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <Images aria-hidden="true" className="h-4 w-4" />
                {activeIndex + 1} / {images.length}
              </span>
              {activeImage.caption ? <span className="text-right">{activeImage.caption}</span> : null}
            </div>
          </div>

          {images.length > 1 ? (
            <>
              <button
                aria-label="이전 사진"
                className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white sm:left-6"
                onClick={() => setActiveIndex((current) => moveIndex(current, -1, images.length))}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="h-6 w-6" />
              </button>
              <button
                aria-label="다음 사진"
                className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white sm:right-6"
                onClick={() => setActiveIndex((current) => moveIndex(current, 1, images.length))}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="h-6 w-6" />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

function moveIndex(current: number | null, delta: number, count: number) {
  if (current === null || count < 1) return current
  return (current + delta + count) % count
}
