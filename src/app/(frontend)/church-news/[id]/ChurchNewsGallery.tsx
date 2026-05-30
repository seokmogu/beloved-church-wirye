'use client'

import { ChevronLeft, ChevronRight, Images } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ChurchNewsImage } from '../ChurchNewsImage'

export type ChurchNewsGalleryImage = {
  alt: string
  caption?: string | null
  fallbackSrc?: string
  height: number
  src: string
  width: number
}

type Props = {
  images: ChurchNewsGalleryImage[]
  title: string
}

export function ChurchNewsGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [pointerStart, setPointerStart] = useState<number | null>(null)
  const imageCount = images.length
  const activeImage = images[activeIndex]
  const canSlide = imageCount > 1
  const counterText = useMemo(() => `${activeIndex + 1} / ${imageCount}`, [activeIndex, imageCount])

  if (!imageCount) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-md border border-border bg-muted text-sm text-muted-foreground">
        이미지 준비 중
      </div>
    )
  }

  function goTo(index: number) {
    setActiveIndex((index + imageCount) % imageCount)
  }

  function goPrevious() {
    goTo(activeIndex - 1)
  }

  function goNext() {
    goTo(activeIndex + 1)
  }

  function handlePointerEnd(clientX: number) {
    if (pointerStart === null || !canSlide) return
    const distance = clientX - pointerStart
    setPointerStart(null)
    if (Math.abs(distance) < 42) return
    if (distance > 0) goPrevious()
    else goNext()
  }

  return (
    <section className="mx-auto max-w-3xl" aria-label={`${title} 이미지 갤러리`}>
      <div
        aria-roledescription="carousel"
        className="group outline-none"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') goPrevious()
          if (event.key === 'ArrowRight') goNext()
        }}
        tabIndex={0}
      >
        <div className="relative overflow-hidden rounded-md border border-border bg-card shadow-sm">
          <div
            className="flex touch-pan-y transition-transform duration-300 ease-out"
            onPointerDown={(event) => setPointerStart(event.clientX)}
            onPointerLeave={(event) => handlePointerEnd(event.clientX)}
            onPointerUp={(event) => handlePointerEnd(event.clientX)}
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <figure
                aria-hidden={index !== activeIndex}
                className="min-w-full"
                key={`${image.src}-${index}`}
                >
                  <div className="relative aspect-[4/5] bg-muted">
                  <ChurchNewsImage
                    alt={image.alt}
                    className="object-contain"
                    fallbackSrc={image.fallbackSrc}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 768px"
                    src={image.src}
                    unoptimized
                  />
                </div>
              </figure>
            ))}
          </div>

          <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
            <Images aria-hidden="true" className="h-3.5 w-3.5" />
            <span>{counterText}</span>
          </div>

          {canSlide ? (
            <>
              <button
                aria-label="이전 이미지"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background focus-visible:outline-2 focus-visible:outline-ring"
                onClick={goPrevious}
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
              </button>
              <button
                aria-label="다음 이미지"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background focus-visible:outline-2 focus-visible:outline-ring"
                onClick={goNext}
                type="button"
              >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {activeImage?.caption ? (
        <p className="mt-3 text-center text-sm text-muted-foreground">{activeImage.caption}</p>
      ) : null}

      {canSlide ? (
        <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="이미지 선택">
          {images.map((image, index) => (
            <button
              aria-label={`${index + 1}번째 이미지 보기`}
              aria-pressed={activeIndex === index}
              className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md border bg-muted transition data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/25"
              data-active={activeIndex === index}
              key={`${image.src}-thumb-${index}`}
              onClick={() => goTo(index)}
              type="button"
            >
              <ChurchNewsImage
                alt=""
                className="object-cover"
                fallbackSrc={image.fallbackSrc}
                fill
                sizes="48px"
                src={image.src}
                unoptimized
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
