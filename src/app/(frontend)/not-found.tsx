import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center py-28 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">404</p>
      <h1 className="mt-3 text-3xl font-bold text-foreground">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-muted-foreground">주소가 바뀌었거나 삭제된 페이지일 수 있습니다.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-light"
        >
          홈으로 가기
        </Link>
        <Link
          href="/worship"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
        >
          예배안내
        </Link>
        <Link
          href="/announcements"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
        >
          교회로그
        </Link>
      </div>
    </main>
  )
}
