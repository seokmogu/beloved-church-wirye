'use client'

type AnalyticsEventParameters = Record<string, string | number | boolean | undefined>

export type TrafficAttribution = {
  entry_channel: 'direct' | 'organic_search' | 'paid_search' | 'referral' | 'social' | 'utm'
  entry_medium?: string
  entry_source?: string
  referrer_host?: string
}

const SOCIAL_HOSTS = ['instagram.com', 'facebook.com', 'kakao.com', 'tiktok.com', 'youtube.com']
const SEARCH_HOSTS = ['google.', 'naver.com', 'daum.net', 'bing.com', 'yahoo.']
const PAID_CLICK_PARAMS = ['dclid', 'gclid', 'gbraid', 'wbraid']
const APPROVED_UTM_SOURCES = new Set([
  'daum',
  'facebook',
  'google',
  'instagram',
  'kakao',
  'linktree',
  'naver',
  'newsletter',
  'offline',
  'qr',
  'tiktok',
  'youtube',
])
const APPROVED_UTM_MEDIA = new Set([
  'email',
  'offline',
  'organic',
  'paid_search',
  'paid_social',
  'qr',
  'referral',
  'social',
])

declare global {
  interface Window {
    dataLayer?: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

function externalReferrerHost(locationURL: URL, referrer: string): string | undefined {
  if (!referrer) return undefined

  try {
    const referrerURL = new URL(referrer)
    if (referrerURL.origin === locationURL.origin) return undefined

    return referrerURL.hostname.toLowerCase()
  } catch {
    return undefined
  }
}

function approvedUTMValue(value: string | null, approvedValues: Set<string>): string | undefined {
  const normalized = value?.trim().toLowerCase()
  return normalized && approvedValues.has(normalized) ? normalized : undefined
}

/**
 * Keeps campaign attribution useful without passing URL query strings, form data,
 * or arbitrary UTM values to analytics. GA4 still owns the canonical
 * source/medium/campaign attribution from controlled UTM links.
 */
export function getTrafficAttribution(locationHref: string, referrer = ''): TrafficAttribution {
  const locationURL = new URL(locationHref)
  const utmSource = approvedUTMValue(
    locationURL.searchParams.get('utm_source'),
    APPROVED_UTM_SOURCES,
  )
  const utmMedium = approvedUTMValue(locationURL.searchParams.get('utm_medium'), APPROVED_UTM_MEDIA)
  const referrerHost = externalReferrerHost(locationURL, referrer)

  if (utmSource || utmMedium) {
    return {
      entry_channel: 'utm',
      entry_medium: utmMedium,
      entry_source: utmSource,
      referrer_host: referrerHost,
    }
  }

  if (!referrerHost) return { entry_channel: 'direct' }

  if (PAID_CLICK_PARAMS.some((name) => locationURL.searchParams.has(name))) {
    return { entry_channel: 'paid_search', referrer_host: referrerHost }
  }

  if (SOCIAL_HOSTS.some((host) => referrerHost === host || referrerHost.endsWith(`.${host}`))) {
    return { entry_channel: 'social', referrer_host: referrerHost }
  }

  if (SEARCH_HOSTS.some((host) => referrerHost.includes(host))) {
    return { entry_channel: 'organic_search', referrer_host: referrerHost }
  }

  return { entry_channel: 'referral', referrer_host: referrerHost }
}

export function trackAnalyticsEvent(name: string, parameters: AnalyticsEventParameters = {}) {
  if (!measurementId || typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args))
  window.gtag('event', name, parameters)
}

export function trackPageView(path: string, { isEntry }: { isEntry: boolean }) {
  const locationURL = new URL(window.location.href)
  const attribution = isEntry
    ? getTrafficAttribution(locationURL.href, document.referrer)
    : undefined

  trackAnalyticsEvent('page_view', {
    ...attribution,
    navigation_type: isEntry ? 'entry' : 'internal',
    page_location: `${locationURL.origin}${path}`,
    page_path: path,
    page_title: document.title,
  })

  if (isEntry) {
    trackAnalyticsEvent('landing_page_view', {
      ...attribution,
      landing_page: path,
    })
  }
}
