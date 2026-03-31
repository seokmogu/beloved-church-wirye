import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container py-28">
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8">
        {/* 404 Number with Brand Colors */}
        <div className="relative">
          <h1 
            className="text-9xl font-bold tracking-tight"
            style={{ 
              color: '#1B3A2D',
              textShadow: '4px 4px 0px #C9A84C'
            }}
          >
            404
          </h1>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold" style={{ color: '#1B3A2D' }}>
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-lg text-gray-600">
            찾으시는 페이지가 없거나 이동했습니다.<br />
            아래 링크를 통해 원하시는 페이지로 이동해보세요.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/">홈으로 가기</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/about">교회 소개</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/announcements">공지사항</Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 pt-8">
          문제가 계속되면{' '}
          <a 
            href="mailto:contact@beloved-church.org" 
            className="underline hover:no-underline"
            style={{ color: '#C9A84C' }}
          >
            관리자에게 문의
          </a>
          해주세요.
        </p>
      </div>
    </div>
  )
}
