import type { ReactNode } from 'react'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const preferredRegion = 'syd1'

type AdminLayoutProps = {
  children: ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  // Keep Payload admin request-scoped on Vercel so its RSC child view is not deferred away.
  return children
}

export default AdminLayout
