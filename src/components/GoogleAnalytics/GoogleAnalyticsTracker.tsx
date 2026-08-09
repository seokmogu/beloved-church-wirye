'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { trackAnalyticsEvent, trackPageView } from './events'

function getDestination(element: HTMLElement) {
  const href = element.getAttribute('href')
  if (!href) return undefined

  try {
    const url = new URL(href, window.location.origin)
    return url.origin === window.location.origin ? url.pathname : url.hostname
  } catch {
    return undefined
  }
}

function getTrackedElement(target: EventTarget | null) {
  if (!(target instanceof Element)) return null

  return target.closest<HTMLElement>('a[href], button, [role="button"], input[type="submit"]')
}

export function GoogleAnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isInitialRoute = useRef(true)
  const search = searchParams.toString()

  useEffect(() => {
    if (isInitialRoute.current) {
      isInitialRoute.current = false
      return
    }

    trackPageView(search ? `${pathname}?${search}` : pathname)
  }, [pathname, search])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const element = getTrackedElement(event.target)
      if (!element) return

      trackAnalyticsEvent('ui_click', {
        click_id: element.dataset.analyticsId || element.id || element.tagName.toLowerCase(),
        element_type: element.tagName.toLowerCase(),
        page_path: window.location.pathname,
        destination: getDestination(element),
      })
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}
