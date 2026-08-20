import { POST } from '@/app/api/newcomers/route'
import { normalizeHeaderNavItems } from '@/Header/normalizeNavItems'
import { isPublicRouteEnabled } from '@/lib/publicRoutes'
import type { Header } from '@/payload-types'
import { describe, expect, it } from 'vitest'

describe('newcomer registration shutdown', () => {
  it('keeps the public registration routes disabled, including query-string links', () => {
    expect(isPublicRouteEnabled('/newcomer')).toBe(false)
    expect(isPublicRouteEnabled('/newcomer?source=header')).toBe(false)
    expect(isPublicRouteEnabled('/newcomer/thank-you')).toBe(false)
    expect(isPublicRouteEnabled('/worship')).toBe(true)
  })

  it('hides saved newcomer links from the public header', () => {
    const header = {
      id: 0,
      navItems: [
        {
          children: [
            { link: { internalPath: '/newcomer', label: '새가족등록', type: 'internal' } },
            { link: { internalPath: '/worship', label: '예배안내', type: 'internal' } },
          ],
          link: { internalPath: '/about', label: '교회소개', type: 'internal' },
        },
      ],
    } as Header

    expect(normalizeHeaderNavItems(header)[0]?.children).toEqual([
      { href: '/worship', label: '예배안내', newTab: false },
    ])
  })

  it('rejects new public registration submissions without reading their body', async () => {
    const response = POST()

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: '새가족등록은 현재 운영하지 않습니다.' })
  })
})
