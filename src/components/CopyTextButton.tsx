'use client'

import { useState } from 'react'

type CopyTextButtonProps = {
  label?: string
  text: string
}

function copyViaTextarea(text: string): boolean {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return copied
  } catch {
    return false
  }
}

export function CopyTextButton({ label = '텍스트 복사', text }: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    let didCopy = true

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      didCopy = copyViaTextarea(text)
    }

    if (!didCopy) {
      window.prompt('자동 복사가 지원되지 않습니다. 아래 내용을 직접 복사해 주세요.', text)
      return
    }

    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-default disabled:text-primary"
      disabled={copied}
    >
      {copied ? '복사되었습니다' : label}
    </button>
  )
}
