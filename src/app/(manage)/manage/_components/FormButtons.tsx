'use client'

import { Loader2, Save, Trash2 } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'

export function SaveButton({ label = '저장' }: { label?: string }) {
  const { pending } = useFormStatus()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const allowNextSubmitRef = useRef(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  useEffect(() => {
    const button = buttonRef.current
    const form = button?.form
    if (!button || !form) return

    const handleSubmit = (event: SubmitEvent) => {
      if (allowNextSubmitRef.current) {
        allowNextSubmitRef.current = false
        return
      }

      const submitter = event.submitter as HTMLElement | null
      if (submitter && submitter !== button) return

      event.preventDefault()
      setConfirmOpen(true)
    }

    form.addEventListener('submit', handleSubmit)
    return () => form.removeEventListener('submit', handleSubmit)
  }, [])

  const submitConfirmed = () => {
    const button = buttonRef.current
    const form = button?.form
    if (!button || !form) return

    allowNextSubmitRef.current = true
    setConfirmOpen(false)
    form.requestSubmit(button)
  }

  return (
    <>
      <button
        aria-busy={pending}
        className="manage-button"
        disabled={pending}
        ref={buttonRef}
        type="submit"
      >
        {pending ? <Loader2 className="manage-spin" /> : <Save />}
        <span>{pending ? '저장 중' : label}</span>
      </button>

      {confirmOpen && !pending ? (
        <div className="manage-confirm-backdrop">
          <div aria-labelledby={titleId} aria-modal="true" className="manage-confirm-dialog" role="dialog">
            <h2 id={titleId}>변경사항을 저장할까요?</h2>
            <p>저장하면 공개 화면에 바로 반영될 수 있습니다.</p>
            <div className="manage-confirm-actions">
              <button
                className="manage-button secondary"
                onClick={() => setConfirmOpen(false)}
                type="button"
              >
                취소
              </button>
              <button className="manage-button" onClick={submitConfirmed} type="button">
                저장하기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pending ? (
        <div aria-live="polite" className="manage-saving-overlay" role="status">
          <Loader2 className="manage-spin" />
          <span>변경사항을 저장하는 중입니다.</span>
        </div>
      ) : null}
    </>
  )
}

export function DeleteButton({ label = '삭제' }: { label?: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      className="manage-button danger"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm('삭제할까요?')) event.preventDefault()
      }}
      type="submit"
    >
      <Trash2 />
      {pending ? '삭제 중' : label}
    </button>
  )
}
