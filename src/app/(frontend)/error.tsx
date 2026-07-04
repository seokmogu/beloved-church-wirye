'use client'

import Link from 'next/link'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface the error to logging/monitoring without exposing details to visitors.
    console.error(error)
  }, [error])

  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>페이지를 표시할 수 없습니다</h1>
        <p className="mb-4">일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => reset()} variant="default">
          다시 시도
        </Button>
        <Button asChild variant="outline">
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </div>
  )
}
