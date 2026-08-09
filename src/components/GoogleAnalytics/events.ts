'use client'

type AnalyticsEventParameters = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function trackAnalyticsEvent(name: string, parameters: AnalyticsEventParameters = {}) {
  if (!measurementId || typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args))
  window.gtag('event', name, parameters)
}

export function trackPageView(path: string) {
  trackAnalyticsEvent('page_view', {
    page_location: window.location.href,
    page_path: path,
    page_title: document.title,
  })
}
