import { describe, expect, it } from 'vitest'

import { normalizeHeaderNavItems } from '@/Header/normalizeNavItems'
import type { Header } from '@/payload-types'

describe('normalizeHeaderNavItems', () => {
  it('keeps top-level menu links and nested submenu links', () => {
    const header = {
      id: 0,
      navItems: [
        {
          link: {
            internalPath: '/about',
            label: '교회소개',
            type: 'internal',
          },
          children: [
            {
              link: {
                internalPath: '/about/leaders',
                label: '섬기는 사람들',
                type: 'internal',
              },
            },
            {
              link: {
                internalPath: '/worship',
                label: '예배안내',
                type: 'internal',
              },
            },
          ],
        },
      ],
    } as Header

    expect(normalizeHeaderNavItems(header)).toEqual([
      {
        children: [
          { href: '/about/leaders', label: '섬기는 사람들', newTab: false },
          { href: '/worship', label: '예배안내', newTab: false },
        ],
        href: '/about',
        label: '교회소개',
        newTab: false,
      },
    ])
  })

  it('drops submenu rows that do not resolve to a usable link', () => {
    const header = {
      id: 0,
      navItems: [
        {
          children: [{ link: { label: '빈 주소', type: 'custom', url: '' } }],
          link: { internalPath: '/', label: '홈', type: 'internal' },
        },
      ],
    } as Header

    expect(normalizeHeaderNavItems(header)).toEqual([
      { children: [], href: '/', label: '홈', newTab: false },
    ])
  })
})
