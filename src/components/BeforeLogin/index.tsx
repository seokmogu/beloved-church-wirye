'use client'

import React, { useEffect, useState } from 'react'

const BeforeLogin: React.FC = () => {
  const [loginFailed, setLoginFailed] = useState(false)

  useEffect(() => {
    let loginFailureTimer: number | undefined

    const resetError = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null

      if (form?.querySelector('#field-email, #field-username, #field-password')) {
        if (loginFailureTimer) {
          window.clearTimeout(loginFailureTimer)
        }

        setLoginFailed(false)

        loginFailureTimer = window.setTimeout(() => {
          const loginFormStillVisible = Boolean(
            document.querySelector('#field-email, #field-username, #field-password'),
          )
          const stillOnLoginRoute = window.location.pathname.includes('/admin/login')

          if (loginFormStillVisible && stillOnLoginRoute) {
            setLoginFailed(true)
          }
        }, 1800)
      }
    }

    document.addEventListener('submit', resetError, true)

    return () => {
      if (loginFailureTimer) {
        window.clearTimeout(loginFailureTimer)
      }

      document.removeEventListener('submit', resetError, true)
    }
  }, [])

  return (
    <div
      style={{
        border: '1px solid rgba(15, 23, 42, 0.12)',
        borderRadius: 12,
        marginBottom: 24,
        padding: 20,
      }}
    >
      <p style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>관리자 로그인</p>
      <p style={{ margin: 0, opacity: 0.72 }}>
        위례 사랑하는교회 사이트 콘텐츠와 디자인을 관리하는 화면입니다.
      </p>
      {loginFailed ? (
        <div
          aria-live="assertive"
          data-testid="admin-login-error"
          role="alert"
          style={{
            background: 'rgba(185, 28, 28, 0.08)',
            border: '1px solid rgba(185, 28, 28, 0.3)',
            borderRadius: 10,
            color: '#991b1b',
            fontWeight: 700,
            marginTop: 16,
            padding: '12px 14px',
          }}
        >
          로그인에 실패했습니다. 이메일 또는 비밀번호를 확인하세요.
        </div>
      ) : null}
    </div>
  )
}

export default BeforeLogin
