'use client'

import { useEffect } from 'react'

// global-error replaces the root layout when a render error escapes it, so it must
// render its own <html>/<body> and stay completely dependency-free (no Tailwind, no
// shared components) — anything it imports could be the thing that just threw.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="ko">
      <body
        style={{
          alignItems: 'center',
          display: 'flex',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          justifyContent: 'center',
          margin: 0,
          minHeight: '100vh',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
            페이지를 표시할 수 없습니다
          </h1>
          <p style={{ color: '#6b7280', lineHeight: 1.6, marginBottom: 20 }}>
            일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#1B3A2D',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
              padding: '10px 20px',
            }}
            type="button"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
