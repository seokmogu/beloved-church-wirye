'use client'

import { useState } from 'react'

interface CopyAccountButtonProps {
  accountNumber: string
}

// clipboard API가 막힌 환경(구형 브라우저, 일부 인앱 웹뷰) 폴백
function copyViaTextarea(text: string): boolean {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

export function CopyAccountButton({ accountNumber }: CopyAccountButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    let ok = true
    try {
      await navigator.clipboard.writeText(accountNumber)
    } catch {
      ok = copyViaTextarea(accountNumber)
    }

    if (!ok) {
      // 복사가 불가능한 환경이면 번호를 바로 보여줘 수동 복사를 돕는다
      window.prompt('자동 복사가 지원되지 않습니다. 계좌번호를 직접 복사해 주세요.', accountNumber)
      return
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      disabled={copied}
    >
      {copied ? '✅ 복사되었습니다!' : '📋 계좌번호 복사하기'}
    </button>
  )
}
