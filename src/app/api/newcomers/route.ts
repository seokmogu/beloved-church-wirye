import { NextRequest, NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const MAX_BODY_BYTES = 32 * 1024

export async function POST(request: NextRequest) {
  try {
    // Reject oversized payloads before parsing (this is a public, unauthenticated route).
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: '요청이 너무 큽니다.' }, { status: 413 })
    }

    const body = await request.json()

    // Honeypot: a hidden field real users never fill. If it's populated, the request is a
    // bot — pretend success without writing so the bot gets no signal to adapt.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ success: true }, { status: 201 })
    }

    // 필수 필드 검증
    const sourceChannels = Array.isArray(body.sourceChannels) ? body.sourceChannels : []
    const churchRoles = Array.isArray(body.churchRoles) ? body.churchRoles : []

    if (
      !body.name ||
      !body.phone ||
      !body.visitDate ||
      !body.gender ||
      sourceChannels.length === 0
    ) {
      return NextResponse.json({ error: '필수 항목을 모두 입력해 주세요.' }, { status: 400 })
    }

    if (
      !body.privacyConsent ||
      !body.groupChatConsent ||
      !body.conductConsent ||
      !body.faithCommunityConsent
    ) {
      return NextResponse.json({ error: '동의/서약 항목을 모두 확인해 주세요.' }, { status: 400 })
    }

    // Payload CMS를 통해 새가족 정보 저장
    const payload = await getPayload({ config: configPromise })

    const newcomer = await payload.create({
      collection: 'newcomers',
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address || undefined,
        age: body.age || undefined,
        baptismStatus: body.baptismStatus || undefined,
        birthDate: body.birthDate || undefined,
        churchRoles,
        conductConsent: body.conductConsent,
        email: body.email || undefined,
        faithCommunityConsent: body.faithCommunityConsent,
        faithExperience: body.faithExperience || undefined,
        gender: body.gender,
        groupChatConsent: body.groupChatConsent,
        visitDate: body.visitDate,
        mbti: body.mbti || undefined,
        previousChurch: body.previousChurch || undefined,
        schoolOrWork: body.schoolOrWork || undefined,
        source: body.source || sourceChannels[0],
        sourceChannels,
        sourceDetail: body.sourceDetail || undefined,
        interests: body.interests || [],
        message: body.message || undefined,
        privacyConsent: body.privacyConsent,
        status: 'pending',
      },
      // 중요: 보안 규칙 우회하지 않음 (access control 적용)
      overrideAccess: false,
    })

    return NextResponse.json({ success: true, id: newcomer.id }, { status: 201 })
  } catch (error) {
    console.error('Newcomer registration error:', error)
    return NextResponse.json(
      { error: '등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 },
    )
  }
}
