import { getManageAuthProvider } from '@/lib/manage/env'
import { createManageNeonAuth } from '@/lib/manage/neon/server'

type AuthRouteContext = {
  params: Promise<{ path: string[] }>
}

async function getNeonAuthHandler() {
  if (getManageAuthProvider() !== 'neon') return null

  return createManageNeonAuth()?.handler() || null
}

async function unavailable() {
  return Response.json({ error: 'Not found' }, { status: 404 })
}

export async function GET(request: Request, context: AuthRouteContext) {
  const handler = await getNeonAuthHandler()
  return handler ? handler.GET(request, context) : unavailable()
}

export async function POST(request: Request, context: AuthRouteContext) {
  const handler = await getNeonAuthHandler()
  return handler ? handler.POST(request, context) : unavailable()
}

export async function PUT(request: Request, context: AuthRouteContext) {
  const handler = await getNeonAuthHandler()
  return handler ? handler.PUT(request, context) : unavailable()
}

export async function DELETE(request: Request, context: AuthRouteContext) {
  const handler = await getNeonAuthHandler()
  return handler ? handler.DELETE(request, context) : unavailable()
}

export async function PATCH(request: Request, context: AuthRouteContext) {
  const handler = await getNeonAuthHandler()
  return handler ? handler.PATCH(request, context) : unavailable()
}
