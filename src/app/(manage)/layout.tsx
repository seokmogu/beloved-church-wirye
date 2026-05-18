import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './manage.css'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata: Metadata = {
  title: '사랑하는교회 관리자',
}

export default function ManageRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
