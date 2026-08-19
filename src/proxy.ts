import { NextResponse, type NextRequest } from 'next/server'

import { getManageAdminForUser, manageAuth } from '@/lib/manage/better-auth'
import { getManageMissingEnv } from '@/lib/manage/env'

export async function proxy(request: NextRequest) {
  // Login and Server Action requests perform their own full checks. Redirecting
  // an Action here would turn its expected RSC response into an opaque error.
  if (request.nextUrl.pathname === '/manage/login' || request.headers.get('next-action')) {
    return NextResponse.next()
  }

  if (getManageMissingEnv().length > 0) {
    return NextResponse.redirect(new URL('/manage/login?error=config', request.url))
  }

  const session = await manageAuth.api.getSession({ headers: request.headers })
  const admin = await getManageAdminForUser(session?.user)

  if (!admin) {
    return NextResponse.redirect(new URL('/manage/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/manage/:path*'],
}
