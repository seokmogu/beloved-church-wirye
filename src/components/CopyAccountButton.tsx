'use client'

import { useState } from 'react'

interface CopyAccountButtonProps {
  accountNumber: string
}

export function CopyAccountButton({ accountNumber }: CopyAccountButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('계좌번호 복사에 실패했습니다')
    }
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
