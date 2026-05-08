import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { resolveCMSLink } from '@/utilities/resolveCMSLink'

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

let payload: Payload
let originalSiteSettings: Record<string, unknown> | null = null
let originalHeader: Record<string, unknown> | null = null
const disableRevalidate = { disableRevalidate: true }

function stripSystemFields<T extends Record<string, unknown> | null>(
  data: T,
): Record<string, unknown> {
  if (!data) return {}
  const { id, createdAt, updatedAt, globalType, ...rest } = data
  return rest
}

describe('CMS control contract', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  beforeEach(async () => {
    originalSiteSettings = (await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
    })) as unknown as Record<string, unknown>
    originalHeader = (await payload.findGlobal({ slug: 'header', depth: 0 })) as unknown as Record<
      string,
      unknown
    >
  })

  afterEach(async () => {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: stripSystemFields(originalSiteSettings),
      context: disableRevalidate,
    })
    await payload.updateGlobal({
      slug: 'header',
      data: stripSystemFields(originalHeader),
      context: disableRevalidate,
    })
  })

  it('resolves CMS links consistently for fixed pages, external URLs, home, page, and post references', () => {
    expect(
      resolveCMSLink({ type: 'internal', internalPath: '/worship', label: '예배', newTab: true }),
    ).toEqual({
      href: '/worship',
      label: '예배',
      newTab: true,
    })

    expect(
      resolveCMSLink({ type: 'custom', url: 'https://example.com', label: '외부', newTab: true }),
    ).toEqual({
      href: 'https://example.com',
      label: '외부',
      newTab: true,
    })

    expect(
      resolveCMSLink({
        type: 'reference',
        label: '홈',
        reference: { relationTo: 'pages', value: { slug: 'home' } },
      }),
    ).toEqual({ href: '/', label: '홈', newTab: false })

    expect(
      resolveCMSLink({
        type: 'reference',
        label: '소개',
        reference: { relationTo: 'pages', value: { slug: 'about' } },
      }),
    ).toEqual({ href: '/about', label: '소개', newTab: false })

    expect(
      resolveCMSLink({
        type: 'reference',
        label: '글',
        reference: { relationTo: 'posts', value: { slug: 'notice' } },
      }),
    ).toEqual({ href: '/posts/notice', label: '글', newTab: false })
  })

  it('persists global settings that drive homepage composition and worship copy', async () => {
    const runId = `int-${Date.now()}`

    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        churchName: `${runId} 교회`,
        heroTitle: `${runId} 히어로`,
        heroSubtitle: `${runId} 부제목`,
        subTagline: `${runId} 보조 문구`,
        worshipServices: [
          {
            name: `${runId} 새벽예배`,
            time: '화요일 오전 6시',
            description: `${runId} 예배 설명`,
          },
        ],
        homeSections: [
          {
            enabled: true,
            sectionType: 'intro',
            eyebrow: 'INT INTRO',
            title: `${runId} 소개`,
            description: `${runId} 소개 본문`,
          },
          {
            enabled: false,
            sectionType: 'announcements',
            eyebrow: 'INT NOTICE',
            title: `${runId} 숨김 공지`,
          },
        ],
        design: {
          primaryColor: '#113322',
          primaryLightColor: '#225544',
          secondaryColor: '#f5e7c8',
          backgroundColor: '#faf9f5',
          sectionBackgroundColor: '#f2f4ef',
          darkSectionBackgroundColor: '#143c2e',
          cardBackgroundColor: '#ffffff',
          textColor: '#171a17',
          mutedTextColor: '#5d675f',
          borderColor: '#d9ded6',
          headerBackgroundColor: '#113322',
          footerBackgroundColor: '#143c2e',
          heroOverlayColor: '#081a12',
          heroOverlayOpacity: 75,
          showHeroPattern: true,
        },
      },
      context: disableRevalidate,
    })

    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

    expect(settings.churchName).toBe(`${runId} 교회`)
    expect(settings.heroTitle).toBe(`${runId} 히어로`)
    expect(settings.worshipServices?.[0]?.name).toBe(`${runId} 새벽예배`)
    expect(settings.design?.primaryColor).toBe('#113322')
    expect(settings.design?.heroOverlayOpacity).toBe(75)
    expect(settings.homeSections?.map((section) => section.sectionType)).toEqual([
      'intro',
      'announcements',
    ])
    expect(settings.homeSections?.[1]?.enabled).toBe(false)
  })

  it('creates a published page and exposes it through the header menu global', async () => {
    const runId = `int-${Date.now()}`
    const slug = `${runId}-managed-page`
    const title = `${runId} 신규 페이지`

    const page = await payload.create({
      collection: 'pages',
      data: {
        title,
        slug,
        hero: { type: 'none' },
        layout: [],
        _status: 'published',
      },
      context: disableRevalidate,
    })

    try {
      await payload.updateGlobal({
        slug: 'header',
        data: {
          navItems: [
            {
              link: {
                type: 'reference',
                reference: {
                  relationTo: 'pages',
                  value: page.id,
                },
                label: title,
              },
            },
          ],
        },
        context: disableRevalidate,
      })

      const header = await payload.findGlobal({ slug: 'header', depth: 1 })
      const resolved = resolveCMSLink(header.navItems?.[0]?.link)

      expect(resolved).toEqual({
        href: `/${slug}`,
        label: title,
        newTab: false,
      })
    } finally {
      await payload.delete({ collection: 'pages', id: page.id, context: disableRevalidate })
    }
  })
})
