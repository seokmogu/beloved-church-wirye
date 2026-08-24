import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ManageShell } from '@/app/(manage)/manage/_components/ManageShell'

describe('관리자 셸', () => {
  it('모바일에서는 접을 수 있는 관리 메뉴와 현재 메뉴를 함께 렌더링한다', () => {
    const markup = renderToStaticMarkup(
      <ManageShell active="menu" user={{ email: 'admin@example.test', id: 'admin' }}>
        <h1>메뉴관리</h1>
      </ManageShell>,
    )

    expect(markup).toContain('class="manage-mobile-header"')
    expect(markup).toContain('class="manage-mobile-menu"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain('aria-label="모바일 관리 메뉴"')
    expect(markup).toContain('href="/manage/menu"')
    expect(markup).toContain('aria-current="page"')
  })
})
