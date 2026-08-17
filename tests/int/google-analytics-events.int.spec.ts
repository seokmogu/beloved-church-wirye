import { afterEach, describe, expect, it, vi } from 'vitest'

import { getTrafficAttribution } from '@/components/GoogleAnalytics/events'
import { getContentSelection } from '@/components/GoogleAnalytics/GoogleAnalyticsTracker'

describe('GA4 traffic attribution', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    delete window.gtag
    delete window.dataLayer
    Object.defineProperty(document, 'referrer', { configurable: true, value: '' })
    window.history.replaceState({}, '', '/')
  })

  it('records an approved UTM channel without copying campaign text', () => {
    expect(
      getTrafficAttribution(
        'https://www.belovedchurch.co.kr/newcomer?utm_source=instagram&utm_medium=social&utm_campaign=welcome_fall',
        'https://l.instagram.com/',
      ),
    ).toEqual({
      entry_channel: 'utm',
      entry_medium: 'social',
      entry_source: 'instagram',
      referrer_host: 'l.instagram.com',
    })
  })

  it('classifies recognised social and search referrers when UTMs are absent', () => {
    expect(
      getTrafficAttribution('https://www.belovedchurch.co.kr/', 'https://m.youtube.com/'),
    ).toEqual({
      entry_channel: 'social',
      referrer_host: 'm.youtube.com',
    })

    expect(
      getTrafficAttribution(
        'https://www.belovedchurch.co.kr/newcomer?gclid=opaque-click-id',
        'https://www.google.com/',
      ),
    ).toEqual({
      entry_channel: 'paid_search',
      referrer_host: 'www.google.com',
    })
  })

  it('does not send arbitrary UTM values that could contain identifying data', () => {
    expect(
      getTrafficAttribution(
        'https://www.belovedchurch.co.kr/newcomer?utm_source=visitor_name&utm_medium=personal_email',
      ),
    ).toEqual({ entry_channel: 'direct' })
  })

  it('sends one initial page view and one landing event without a query string', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST')
    vi.resetModules()
    window.history.replaceState(
      {},
      '',
      '/newcomer?utm_source=instagram&utm_medium=social&utm_campaign=welcome',
    )
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'https://l.instagram.com/',
    })
    document.title = '새가족등록 | 사랑하는교회'

    const events: unknown[][] = []
    window.gtag = (...args: unknown[]) => events.push(args)

    const { trackPageView } = await import('@/components/GoogleAnalytics/events')
    trackPageView('/newcomer', { isEntry: true })

    expect(events).toEqual([
      [
        'event',
        'page_view',
        expect.objectContaining({
          entry_channel: 'utm',
          entry_medium: 'social',
          entry_source: 'instagram',
          navigation_type: 'entry',
          page_location: 'http://localhost:3000/newcomer',
          page_path: '/newcomer',
        }),
      ],
      [
        'event',
        'landing_page_view',
        expect.objectContaining({
          entry_channel: 'utm',
          landing_page: '/newcomer',
        }),
      ],
    ])
  })
})

describe('GA4 content event taxonomy', () => {
  it('uses a safe, typed identifier for public content selections', () => {
    expect(getContentSelection('/sermon/AbCdEfG_123')).toEqual({
      content_id: 'sermon_AbCdEfG_123',
      content_type: 'sermon',
    })
    expect(getContentSelection('/church-news/videos/42')).toEqual({
      content_id: 'church_video_42',
      content_type: 'church_video',
    })
    expect(getContentSelection('/announcements/19')).toEqual({
      content_id: 'announcement_19',
      content_type: 'announcement',
    })
  })

  it('does not classify routes outside the public content detail pages', () => {
    expect(getContentSelection('/newcomer')).toBeUndefined()
    expect(getContentSelection('/announcements?page=2')).toBeUndefined()
    expect(getContentSelection('/church-news/videos/not-an-id')).toBeUndefined()
    expect(getContentSelection(`/bulletins/${'1'.repeat(41)}`)).toBeUndefined()
  })
})
