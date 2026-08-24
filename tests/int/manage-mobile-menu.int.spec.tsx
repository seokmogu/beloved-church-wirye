import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ManageMobileMenu } from '@/app/(manage)/manage/_components/ManageMobileMenu'
import { ManageLoginSubmitButton } from '@/app/(manage)/manage/login/ManageLoginSubmitButton'

afterEach(() => {
  cleanup()
  document.body.style.overflow = ''
})

describe('모바일 관리자 메뉴', () => {
  it('열린 뒤 Escape로 닫고 메뉴 버튼에 다시 초점을 둔다', async () => {
    render(
      <ManageMobileMenu>
        <a href="#dashboard">대시보드</a>
      </ManageMobileMenu>,
    )

    const toggle = screen.getByRole('button', { name: '관리 메뉴 열기' })
    fireEvent.click(toggle)

    await waitFor(() => {
      expect(toggle.getAttribute('aria-expanded')).toBe('true')
      expect(document.activeElement).toBe(screen.getByRole('link', { name: '대시보드' }))
    })
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => expect(toggle.getAttribute('aria-expanded')).toBe('false'))
    expect(document.activeElement).toBe(toggle)
    expect(document.body.style.overflow).toBe('')
  })

  it('메뉴 링크를 누르면 패널을 닫는다', async () => {
    render(
      <ManageMobileMenu>
        <a href="#menu" onClick={(event) => event.preventDefault()}>
          메뉴관리
        </a>
      </ManageMobileMenu>,
    )

    const toggle = screen.getByRole('button', { name: '관리 메뉴 열기' })
    fireEvent.click(toggle)
    await waitFor(() => expect(toggle.getAttribute('aria-expanded')).toBe('true'))

    fireEvent.click(screen.getByRole('link', { name: '메뉴관리' }))

    await waitFor(() => expect(toggle.getAttribute('aria-expanded')).toBe('false'))
  })
})

describe('관리자 로그인 제출 버튼', () => {
  it('제출이 진행되는 동안 상태를 알리고 중복 제출을 막는다', async () => {
    let resolveAction: (() => void) | undefined
    const action = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve
        }),
    )

    render(
      <form action={action}>
        <ManageLoginSubmitButton />
      </form>,
    )

    fireEvent.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      const pendingButton = screen.getByRole('button', {
        name: '로그인 확인 중',
      }) as HTMLButtonElement
      expect(pendingButton.disabled).toBe(true)
      expect(screen.getByRole('status').textContent).toContain('계정 정보를 확인하고 있습니다.')
    })

    resolveAction?.()

    await waitFor(() => {
      const loginButton = screen.getByRole('button', { name: '로그인' }) as HTMLButtonElement
      expect(loginButton.disabled).toBe(false)
    })
  })
})
