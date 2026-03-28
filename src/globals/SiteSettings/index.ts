import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '사이트 설정',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: '히어로 배경 이미지',
      admin: {
        description: '홈페이지 상단 배경 이미지. 권장 해상도: 1920x1080 이상',
      },
    },
    {
      name: 'heroTitle',
      type: 'text',
      label: '히어로 제목',
      defaultValue: '사랑하는교회',
    },
    {
      name: 'heroSubtitle',
      type: 'text',
      label: '히어로 부제목',
      defaultValue: '위례에서 하나님의 사랑을 나누는 공동체',
    },
    {
      name: 'churchDescription',
      type: 'textarea',
      label: '교회 소개',
      defaultValue:
        '사랑하는교회는 기독교대한감리회 소속으로, 위례 신도시에서 하나님의 말씀을 중심으로 모이는 공동체입니다.',
    },
  ],
}
