'use client'

import { Loader2, LogIn } from 'lucide-react'
import { useFormStatus } from 'react-dom'

export function ManageLoginSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <>
      <button
        aria-busy={pending}
        className="manage-button manage-login-submit"
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <Loader2 aria-hidden="true" className="manage-spin" />
        ) : (
          <LogIn aria-hidden="true" />
        )}
        <span>{pending ? '로그인 확인 중' : '로그인'}</span>
      </button>
      {pending ? (
        <div aria-live="polite" className="manage-login-loading" role="status">
          <Loader2 aria-hidden="true" className="manage-spin" />
          <span>계정 정보를 확인하고 있습니다. 잠시만 기다려 주세요.</span>
        </div>
      ) : null}
    </>
  )
}
