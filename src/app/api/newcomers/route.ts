import { NextResponse } from 'next/server'

export function POST() {
  return NextResponse.json({ error: '새가족등록은 현재 운영하지 않습니다.' }, { status: 404 })
}
