import { describe, expect, it } from 'vitest'

import { Newcomers } from '@/collections/Newcomers'

describe('newcomer registration privacy', () => {
  it('does not register an after-change hook that could log a registrant contact', () => {
    expect(Newcomers.hooks?.afterChange).toBeUndefined()
  })
})
