import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 필수 필드 검증
    if (!body.name || !body.phone || !body.visitSource) {
      return NextResponse.json(
        { error: '필수 입력 항목을 확인해주세요' },
        { status: 400 }
      )
    }

    if (!body.contactConsent) {
      return NextResponse.json(
        { error: '개인정보 수집 및 연락 동의가 필요합니다' },
        { status: 400 }
      )
    }

    // Payload CMS에 저장
    const payload = await getPayload({ config: configPromise })
    
    const newcomer = await payload.create({
      collection: 'newcomers',
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || undefined,
        age: body.age || 'not-specified',
        familyStatus: body.familyStatus || 'not-specified',
        visitSource: body.visitSource,
        interests: body.interests || [],
        message: body.message || undefined,
        contactConsent: body.contactConsent,
      },
      // Public access이므로 user 없이 생성
      overrideAccess: false,
    })

    return NextResponse.json(
      { success: true, id: newcomer.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newcomer registration error:', error)
    return NextResponse.json(
      { error: '등록 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
