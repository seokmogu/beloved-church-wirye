import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 필수 필드 검증
    if (!body.name || !body.phone || !body.visitDate || !body.source || !body.privacyConsent) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해 주세요.' },
        { status: 400 },
      )
    }

    // Payload CMS를 통해 새가족 정보 저장
    const payload = await getPayload({ config: configPromise })

    const newcomer = await payload.create({
      collection: 'newcomers',
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || undefined,
        visitDate: body.visitDate,
        source: body.source,
        sourceDetail: body.sourceDetail || undefined,
        interests: body.interests || [],
        message: body.message || undefined,
        privacyConsent: body.privacyConsent,
        status: 'pending',
      },
      // 중요: 보안 규칙 우회하지 않음 (access control 적용)
      overrideAccess: false,
    })

    return NextResponse.json(
      { success: true, id: newcomer.id },
      { status: 201 },
    )
  } catch (error) {
    console.error('Newcomer registration error:', error)
    return NextResponse.json(
      { error: '등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 },
    )
  }
}
