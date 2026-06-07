import type { CollectionConfig } from 'payload'

// Max lengths for the free-text fields on the PUBLIC create path. Enforced in a
// beforeValidate hook so the cap applies to both the custom /api/newcomers route AND a
// direct Payload REST create — a route-handler-only check could not cover the latter.
const MAX_TEXT_LENGTHS: Record<string, number> = {
  address: 200,
  age: 16,
  email: 200,
  mbti: 16,
  message: 2000,
  name: 80,
  phone: 30,
  previousChurch: 120,
  schoolOrWork: 120,
  sourceDetail: 2000,
}

export const Newcomers: CollectionConfig = {
  slug: 'newcomers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'visitDate', 'gender', 'source', 'createdAt'],
    description: '새가족 신청과 후속 연락 상태를 관리합니다.',
    group: '4. 새가족/계정',
  },
  labels: {
    singular: '새가족',
    plural: '새가족',
  },
  defaultSort: '-createdAt',
  access: {
    // 제출은 누구나 가능 (공개 폼)
    create: () => true,
    // 읽기/수정/삭제는 인증된 관리자만
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: '이름',
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: '연락처',
      admin: {
        description: '예: 010-1234-5678',
      },
    },
    {
      name: 'gender',
      type: 'select',
      required: true,
      label: '성별',
      options: [
        { label: '남', value: 'male' },
        { label: '여', value: 'female' },
      ],
    },
    {
      name: 'birthDate',
      type: 'date',
      label: '생년월일',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'age',
      type: 'text',
      label: '나이',
    },
    {
      name: 'address',
      type: 'text',
      label: '주소',
    },
    {
      name: 'schoolOrWork',
      type: 'text',
      label: '학교/직장',
    },
    {
      name: 'email',
      type: 'email',
      label: '이메일',
      admin: {
        description: '선택 사항',
      },
    },
    {
      name: 'visitDate',
      type: 'date',
      required: true,
      label: '등록신청일',
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      label: '대표 방문경로',
      options: [
        { label: '전도/소개', value: 'referral' },
        { label: '인터넷 검색', value: 'search' },
        { label: 'SNS', value: 'sns' },
        { label: '유튜브', value: 'youtube' },
        { label: '지나가다가', value: 'passingBy' },
        { label: '기타', value: 'other' },
      ],
      defaultValue: 'referral',
    },
    {
      name: 'sourceChannels',
      type: 'select',
      label: '방문경로',
      hasMany: true,
      options: [
        { label: '전도/소개', value: 'referral' },
        { label: 'SNS', value: 'sns' },
        { label: '유튜브', value: 'youtube' },
        { label: '인터넷 검색', value: 'search' },
        { label: '기타', value: 'other' },
      ],
      admin: {
        description: '등록카드 체크 항목입니다. 여러 개 선택할 수 있습니다.',
      },
    },
    {
      name: 'sourceDetail',
      type: 'textarea',
      label: '경로 상세',
      admin: {
        description: '예: 친구 이름, 검색 키워드, SNS 계정 등 (선택 사항)',
        rows: 2,
      },
    },
    {
      name: 'faithExperience',
      type: 'select',
      label: '신앙경력',
      options: [
        { label: '교회가 처음', value: 'firstTime' },
        { label: '오래 쉬었어요', value: 'returning' },
        { label: '교회 이동', value: 'transfer' },
      ],
    },
    {
      name: 'previousChurch',
      type: 'text',
      label: '기존교회',
    },
    {
      name: 'mbti',
      type: 'text',
      label: 'MBTI',
    },
    {
      name: 'baptismStatus',
      type: 'select',
      label: '세례',
      options: [
        { label: '받음', value: 'baptized' },
        { label: '안 받음', value: 'notBaptized' },
      ],
    },
    {
      name: 'churchRoles',
      type: 'select',
      label: '직분',
      hasMany: true,
      options: [
        { label: '집사', value: 'deacon' },
        { label: '권사', value: 'kwonsa' },
        { label: '장로', value: 'elder' },
        { label: '목회자', value: 'pastor' },
      ],
    },
    {
      name: 'interests',
      type: 'select',
      label: '관심있는 사역/모임',
      hasMany: true,
      options: [
        { label: '청년부', value: 'youngAdults' },
        { label: '찬양팀', value: 'worship' },
        { label: '성경공부', value: 'bibleStudy' },
        { label: '봉사', value: 'service' },
        { label: '기도회', value: 'prayer' },
        { label: '소그룹', value: 'smallGroup' },
        { label: '아직 잘 모르겠어요', value: 'notSure' },
      ],
      admin: {
        description: '여러 개 선택 가능 (선택 사항)',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: '문의사항 또는 기도제목',
      admin: {
        description: '궁금한 점이나 기도 요청이 있으시면 자유롭게 작성해 주세요 (선택 사항)',
        rows: 4,
      },
    },
    {
      name: 'privacyConsent',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      label: '개인정보 사용 동의',
      admin: {
        description: '등록카드에 기재된 개인정보는 교회목양 사역에만 사용됩니다.',
      },
    },
    {
      name: 'groupChatConsent',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      label: '단체카톡방 초대 동의',
      admin: {
        description: '교회 공지사항 및 긴급 중보기도 전달 목적',
      },
    },
    {
      name: 'conductConsent',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      label: '금품 거래 및 사업 목적 사적 연락 금지 동의',
    },
    {
      name: 'faithCommunityConsent',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      label: '비신앙적/이단적 행위 금지 동의',
      admin: {
        description: '음주, 도박, 외부성경공부 권유 등',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: '상태',
      defaultValue: 'pending',
      options: [
        { label: '대기 중', value: 'pending' },
        { label: '연락 완료', value: 'contacted' },
        { label: '방문 완료', value: 'visited' },
        { label: '등록 완료', value: 'registered' },
      ],
      admin: {
        description: '관리자만 수정 가능',
      },
      access: {
        create: ({ req: { user } }) => Boolean(user),
        update: ({ req: { user } }) => Boolean(user),
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: '관리자 메모',
      admin: {
        description: '내부 기록용 (새가족에게 노출되지 않음)',
        rows: 3,
      },
      access: {
        create: ({ req: { user } }) => Boolean(user),
        update: ({ req: { user } }) => Boolean(user),
        read: ({ req: { user } }) => Boolean(user),
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const record = data as Record<string, unknown>
        for (const [field, max] of Object.entries(MAX_TEXT_LENGTHS)) {
          const value = record[field]
          if (typeof value === 'string') {
            record[field] = value.trim().slice(0, max)
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ operation, doc, req }) => {
        // 새 등록 시 담당자에게 이메일 알림 (향후 구현)
        if (operation === 'create') {
          req.payload.logger.info(`새가족등록: ${doc.name} (${doc.phone})`)
          // TODO: 이메일 알림 기능 추가 (Resend API 또는 다른 서비스)
        }
      },
    ],
  },
}
