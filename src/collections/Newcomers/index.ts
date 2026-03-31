import type { CollectionConfig } from 'payload'

export const Newcomers: CollectionConfig = {
  slug: 'newcomers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'visitSource', 'createdAt'],
  },
  labels: {
    singular: '새가족',
    plural: '새가족',
  },
  defaultSort: '-createdAt',
  access: {
    // 새가족 등록은 누구나 가능 (public)
    create: () => true,
    // 읽기/수정/삭제는 인증된 사용자만
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
        description: '휴대폰 번호 (예: 010-1234-5678)',
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
      name: 'age',
      type: 'select',
      label: '연령대',
      options: [
        { label: '20대 이하', value: '20s-below' },
        { label: '30대', value: '30s' },
        { label: '40대', value: '40s' },
        { label: '50대', value: '50s' },
        { label: '60대 이상', value: '60s-above' },
        { label: '선택 안 함', value: 'not-specified' },
      ],
      defaultValue: 'not-specified',
    },
    {
      name: 'familyStatus',
      type: 'select',
      label: '가정 상황',
      options: [
        { label: '미혼', value: 'single' },
        { label: '기혼 (자녀 없음)', value: 'married-no-children' },
        { label: '기혼 (자녀 있음)', value: 'married-with-children' },
        { label: '선택 안 함', value: 'not-specified' },
      ],
      defaultValue: 'not-specified',
    },
    {
      name: 'visitSource',
      type: 'select',
      label: '교회를 알게 된 경로',
      required: true,
      options: [
        { label: '지인 소개', value: 'referral' },
        { label: '인터넷 검색', value: 'search' },
        { label: '소셜 미디어', value: 'social-media' },
        { label: '동네에서 우연히', value: 'neighborhood' },
        { label: '전단지/광고', value: 'advertisement' },
        { label: '기타', value: 'other' },
      ],
    },
    {
      name: 'interests',
      type: 'select',
      label: '관심 있는 사역',
      hasMany: true,
      options: [
        { label: '예배', value: 'worship' },
        { label: '성경 공부', value: 'bible-study' },
        { label: '소그룹', value: 'small-group' },
        { label: '봉사', value: 'volunteer' },
        { label: '기도', value: 'prayer' },
        { label: '찬양', value: 'praise' },
        { label: '아직 모르겠음', value: 'not-sure' },
      ],
      admin: {
        description: '복수 선택 가능',
      },
    },
    {
      name: 'message',
      type: 'textarea',
      label: '하고 싶은 말',
      admin: {
        description: '자유롭게 작성해 주세요 (선택 사항)',
      },
    },
    {
      name: 'contactConsent',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      label: '연락 동의',
      admin: {
        description: '새가족 담당자가 연락드리는 것에 동의합니다',
      },
    },
  ],
  hooks: {
    afterChange: [
      // 새 등록 시 담당자에게 이메일 알림
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          // TODO: 이메일 알림 로직 추가 (추후 구현)
          req.payload.logger.info(`새가족 등록: ${doc.name} (${doc.phone})`)
        }
      },
    ],
  },
}
