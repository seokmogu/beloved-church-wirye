'use client'

import { Menu, X } from 'lucide-react'
import type { MouseEvent, ReactNode } from 'react'
import { useEffect, useId, useRef, useState } from 'react'

export function ManageMobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const firstControl = panelRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled])',
    )
    firstControl?.focus()
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      event.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const closeAfterNavigation = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target
    if (target instanceof Element && target.closest('a[href]')) setOpen(false)
  }

  return (
    <div className="manage-mobile-menu">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={open ? '관리 메뉴 닫기' : '관리 메뉴 열기'}
        className="manage-mobile-menu-toggle"
        onClick={() => setOpen((current) => !current)}
        ref={buttonRef}
        type="button"
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        <span>{open ? '닫기' : '메뉴'}</span>
      </button>
      {open ? (
        <button
          aria-label="관리 메뉴 닫기"
          className="manage-mobile-menu-backdrop"
          onClick={() => setOpen(false)}
          type="button"
        />
      ) : null}
      <div
        aria-hidden={!open}
        className={`manage-mobile-menu-panel${open ? ' is-open' : ''}`}
        id={panelId}
        onClickCapture={closeAfterNavigation}
        ref={panelRef}
      >
        {children}
      </div>
    </div>
  )
}
