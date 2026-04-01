import type { Block } from 'payload'

export const OfferingBlock: Block = {
  slug: 'offeringBlock',
  labels: { singular: '헌금 안내', plural: '헌금 안내' },
  interfaceName: 'OfferingBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '제목',
      defaultValue: '헌금 안내',
    },
    {
      name: 'description',
      type: 'textarea',
      label: '안내 메시지',
      admin: {
        description: '헌금 관련 안내 문구 (선택 사항)',
      },
    },
    {
      name: 'showBankInfo',
      type: 'checkbox',
      label: '계좌 정보 표시',
      defaultValue: true,
      admin: {
        description: 'SiteSettings의 헌금 계좌 정보를 표시합니다',
      },
    },
    {
      name: 'showKakaoPay',
      type: 'checkbox',
      label: '카카오페이 QR 코드 표시',
      defaultValue: true,
      admin: {
        description: 'SiteSettings의 카카오페이 QR 코드를 표시합니다 (등록된 경우)',
      },
    },
  ],
}
