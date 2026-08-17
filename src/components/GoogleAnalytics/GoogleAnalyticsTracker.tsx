'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { trackAnalyticsEvent, trackPageView } from './events'

type ClickDestination =
  | { kind: 'external'; value: string }
  | { kind: 'internal'; value: string }
  | { kind: 'other'; value?: undefined }

type ContentSelection = {
  content_id: string
  content_type: 'announcement' | 'bulletin' | 'church_news' | 'church_video' | 'sermon'
}

type EmbedTrackingData = {
  content_id?: string
  content_type: string
  embed_type: string
}

type YouTubePlayer = {
  getCurrentTime: () => number
  getDuration: () => number
}

type YouTubePlayerEvent = {
  data: number
}

type YouTubeNamespace = {
  Player: new (
    element: HTMLIFrameElement,
    options: {
      events: {
        onStateChange: (event: YouTubePlayerEvent) => void
      }
    },
  ) => YouTubePlayer
}

declare global {
  interface Window {
    YT?: YouTubeNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

const SCROLL_DEPTHS = [25, 50, 75, 90]
const YOUTUBE_ENDED = 0
const YOUTUBE_PLAYING = 1
const YOUTUBE_PAUSED = 2

function safeAnalyticsValue(value: string | undefined) {
  return value && /^[a-z0-9][a-z0-9_-]{0,79}$/i.test(value) ? value.toLowerCase() : undefined
}

function getDestination(element: HTMLElement): ClickDestination {
  const href = element.getAttribute('href')
  if (!href) return { kind: 'other' }

  try {
    const url = new URL(href, window.location.origin)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return { kind: 'other' }

    return url.origin === window.location.origin
      ? { kind: 'internal', value: url.pathname }
      : { kind: 'external', value: url.hostname.toLowerCase() }
  } catch {
    return { kind: 'other' }
  }
}

function getTrackedElement(target: EventTarget | null) {
  if (!(target instanceof Element)) return null

  return target.closest<HTMLElement>('a[href], button, [role="button"], input[type="submit"]')
}

function getClickID(element: HTMLElement) {
  const candidate = element.dataset.analyticsId || element.id
  const safeCandidate = safeAnalyticsValue(candidate)
  if (safeCandidate) return safeCandidate

  return element.tagName.toLowerCase()
}

function getFileExtension(element: HTMLElement) {
  const href = element.getAttribute('href')
  if (!href) return undefined

  try {
    return new URL(href, window.location.origin).pathname
      .match(/\.([a-z0-9]{1,10})$/i)?.[1]
      ?.toLowerCase()
  } catch {
    return undefined
  }
}

export function getContentSelection(pathname: string): ContentSelection | undefined {
  const matches = [
    {
      content_type: 'sermon' as const,
      pattern: /^\/sermon\/([a-z0-9_-]{11})$/i,
      prefix: 'sermon',
    },
    {
      content_type: 'church_video' as const,
      pattern: /^\/church-news\/videos\/(\d{1,40})$/,
      prefix: 'church_video',
    },
    {
      content_type: 'church_news' as const,
      pattern: /^\/church-news\/(\d{1,40})$/,
      prefix: 'church_news',
    },
    {
      content_type: 'announcement' as const,
      pattern: /^\/announcements\/(\d{1,40})$/,
      prefix: 'announcement',
    },
    {
      content_type: 'bulletin' as const,
      pattern: /^\/bulletins\/(\d{1,40})$/,
      prefix: 'bulletin',
    },
  ]

  for (const match of matches) {
    const contentID = pathname.match(match.pattern)?.[1]
    if (contentID) {
      return {
        content_id: `${match.prefix}_${contentID}`,
        content_type: match.content_type,
      }
    }
  }

  return undefined
}

function getEmbedTrackingData(target: EventTarget | null): EmbedTrackingData | undefined {
  if (!(target instanceof Element)) return undefined

  const element = target.closest<HTMLElement>('[data-analytics-embed]')
  if (!element) return undefined

  const embedType = safeAnalyticsValue(element.dataset.analyticsEmbed)
  const contentType = safeAnalyticsValue(element.dataset.analyticsContentType)
  if (!embedType || !contentType) return undefined

  return {
    content_id: safeAnalyticsValue(element.dataset.analyticsContentId),
    content_type: contentType,
    embed_type: embedType,
  }
}

function loadYouTubeIframeAPI(): Promise<YouTubeNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)

  return new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady
    const ready = () => {
      previousReady?.()
      if (window.YT?.Player) resolve(window.YT)
      else reject(new Error('YouTube IFrame Player API unavailable'))
    }

    window.onYouTubeIframeAPIReady = ready

    const existingScript = document.getElementById('youtube-iframe-api') as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener(
        'error',
        () => reject(new Error('YouTube IFrame Player API failed')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.id = 'youtube-iframe-api'
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.addEventListener('error', () => reject(new Error('YouTube IFrame Player API failed')), {
      once: true,
    })
    document.head.appendChild(script)
  })
}

function trackYouTubePlayer(api: YouTubeNamespace, iframe: HTMLIFrameElement) {
  const contentID = safeAnalyticsValue(iframe.dataset.youtubeVideoId)
  const contentType = safeAnalyticsValue(iframe.dataset.analyticsContentType)
  if (!contentID || !contentType) return

  try {
    const sourceURL = new URL(iframe.src)
    sourceURL.searchParams.set('origin', window.location.origin)
    iframe.src = sourceURL.toString()
  } catch {
    return
  }

  const eventParameters = {
    content_id: `youtube_${contentID}`,
    content_type: contentType,
    page_path: window.location.pathname,
    video_provider: 'youtube',
  }
  const reportedProgress = new Set<number>()
  let hasStarted = false
  let progressTimer: number | undefined
  let player: YouTubePlayer

  const clearProgressTimer = () => {
    if (progressTimer !== undefined) window.clearInterval(progressTimer)
    progressTimer = undefined
  }

  const reportProgress = () => {
    if (!iframe.isConnected) {
      clearProgressTimer()
      return
    }

    const duration = player.getDuration()
    const currentTime = player.getCurrentTime()
    if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(currentTime)) return

    const percent = (currentTime / duration) * 100
    for (const threshold of [25, 50, 75]) {
      if (percent >= threshold && !reportedProgress.has(threshold)) {
        reportedProgress.add(threshold)
        trackAnalyticsEvent('church_video_progress', {
          ...eventParameters,
          video_percent: threshold,
        })
      }
    }
  }

  player = new api.Player(iframe, {
    events: {
      onStateChange: ({ data }) => {
        if (data === YOUTUBE_PLAYING) {
          if (!hasStarted) {
            hasStarted = true
            trackAnalyticsEvent('church_video_start', eventParameters)
          }
          reportProgress()
          if (progressTimer === undefined) progressTimer = window.setInterval(reportProgress, 5_000)
          return
        }

        if (data === YOUTUBE_PAUSED) {
          reportProgress()
          clearProgressTimer()
          return
        }

        if (data === YOUTUBE_ENDED) {
          reportProgress()
          clearProgressTimer()
          trackAnalyticsEvent('church_video_complete', eventParameters)
        }
      },
    },
  })
}

export function GoogleAnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isInitialRoute = useRef(true)
  const viewedEmbeds = useRef(new WeakSet<Element>())
  const trackedYouTubePlayers = useRef(new WeakSet<HTMLIFrameElement>())
  const seenScrollDepths = useRef(new Set<number>())
  const search = searchParams.toString()

  useEffect(() => {
    const isEntry = isInitialRoute.current
    isInitialRoute.current = false

    const pagePath = pathname || '/'
    trackPageView(pagePath, { isEntry })

    if (pagePath === '/newcomer') {
      trackAnalyticsEvent('newcomer_registration_view', { page_path: pagePath })
    }

    if (pagePath === '/newcomer/thank-you') {
      trackAnalyticsEvent('newcomer_completed_view', { page_path: pagePath })
    }
  }, [pathname, search])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const embed = getEmbedTrackingData(event.target)
      if (embed) {
        trackAnalyticsEvent('embedded_interaction', {
          ...embed,
          page_path: window.location.pathname,
        })
      }

      const element = getTrackedElement(event.target)
      if (!element) return

      const destination = getDestination(element)
      const clickID = getClickID(element)
      const pagePath = window.location.pathname

      trackAnalyticsEvent('ui_click', {
        click_id: clickID,
        destination: destination.value,
        destination_type: destination.kind,
        element_type: element.tagName.toLowerCase(),
        page_path: pagePath,
      })

      if (destination.kind === 'external') {
        trackAnalyticsEvent('outbound_click', {
          click_id: clickID,
          destination_host: destination.value,
          page_path: pagePath,
        })
      }

      if (destination.kind === 'internal' && destination.value === '/newcomer') {
        trackAnalyticsEvent('newcomer_cta_click', {
          click_id: clickID,
          page_path: pagePath,
        })
      }

      if (destination.kind === 'internal') {
        const selection = getContentSelection(destination.value)
        if (selection) {
          trackAnalyticsEvent('select_content', {
            ...selection,
            page_path: pagePath,
          })
        }
      }

      const isDownload = element.hasAttribute('download')
      const fileExtension = getFileExtension(element)
      if (isDownload || fileExtension) {
        trackAnalyticsEvent('resource_open', {
          file_extension: fileExtension || 'download',
          link_id: clickID,
          page_path: pagePath,
        })
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  useEffect(() => {
    const handleToggle = (event: Event) => {
      const element = event.target
      if (!(element instanceof HTMLDetailsElement) || !element.dataset.analyticsId) return

      trackAnalyticsEvent(element.open ? 'accordion_open' : 'accordion_close', {
        accordion_id: getClickID(element),
        page_path: window.location.pathname,
      })
    }

    document.addEventListener('toggle', handleToggle, true)
    return () => document.removeEventListener('toggle', handleToggle, true)
  }, [])

  useEffect(() => {
    seenScrollDepths.current.clear()
    let frameID: number | undefined

    const reportScrollDepth = () => {
      frameID = undefined
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      )
      const viewportBottom = window.scrollY + window.innerHeight
      if (documentHeight <= window.innerHeight) return

      const progress = (viewportBottom / documentHeight) * 100
      for (const threshold of SCROLL_DEPTHS) {
        if (progress >= threshold && !seenScrollDepths.current.has(threshold)) {
          seenScrollDepths.current.add(threshold)
          trackAnalyticsEvent('scroll_depth', {
            page_path: pathname || '/',
            percent_scrolled: threshold,
          })
        }
      }
    }

    const handleScroll = () => {
      if (frameID === undefined) frameID = window.requestAnimationFrame(reportScrollDepth)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (frameID !== undefined) window.cancelAnimationFrame(frameID)
    }
  }, [pathname])

  useEffect(() => {
    const embeds = Array.from(document.querySelectorAll<HTMLElement>('[data-analytics-embed]'))
    if (!embeds.length || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue
          if (viewedEmbeds.current.has(entry.target)) continue

          const embed = getEmbedTrackingData(entry.target)
          if (!embed) continue

          viewedEmbeds.current.add(entry.target)
          trackAnalyticsEvent('embedded_content_view', {
            ...embed,
            page_path: window.location.pathname,
          })
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.5 },
    )

    embeds.forEach((embed) => observer.observe(embed))
    return () => observer.disconnect()
  }, [pathname, search])

  useEffect(() => {
    const iframes = Array.from(
      document.querySelectorAll<HTMLIFrameElement>(
        'iframe[data-analytics-embed="youtube"][data-youtube-video-id]',
      ),
    ).filter((iframe) => !trackedYouTubePlayers.current.has(iframe))
    if (!iframes.length) return

    let cancelled = false
    void loadYouTubeIframeAPI()
      .then((api) => {
        if (cancelled) return

        for (const iframe of iframes) {
          if (!iframe.isConnected || trackedYouTubePlayers.current.has(iframe)) continue
          trackedYouTubePlayers.current.add(iframe)
          trackYouTubePlayer(api, iframe)
        }
      })
      .catch(() => {
        // The embedded video remains usable if the optional analytics API cannot load.
      })

    return () => {
      cancelled = true
    }
  }, [pathname, search])

  return null
}
