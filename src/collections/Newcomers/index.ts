import type { CollectionConfig } from 'payload'

export const Newcomers: CollectionConfig = {
  slug: 'newcomers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'visitDate', 'source', 'createdAt'],
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
      label: '방문 예정일 또는 첫 방문일',
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: '주일 예배 또는 금요 예배일을 선택해 주세요',
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      label: '교회를 알게 된 경로',
      options: [
        { label: '지인 소개', value: 'referral' },
        { label: '인터넷 검색', value: 'search' },
        { label: 'SNS (인스타그램, 페이스북 등)', value: 'sns' },
        { label: '유튜브', value: 'youtube' },
        { label: '지나가다가', value: 'passingBy' },
        { label: '기타', value: 'other' },
      ],
      defaultValue: 'referral',
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
      label: '개인정보 수집 및 이용 동의',
      admin: {
        description:
          '입력하신 정보는 새가족 환영 및 교회 안내 목적으로만 사용되며, 본인의 동의 없이 제3자에게 제공되지 않습니다.',
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
