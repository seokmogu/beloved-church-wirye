import type { GlobalConfig } from 'payload'

export const SpecialBanner: GlobalConfig = {
  slug: 'special-banner',
  label: '특별 배너',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: '배너 활성화',
      defaultValue: false,
      admin: {
        description: '체크하면 배너가 표시됩니다',
      },
    },
    {
      name: 'text',
      type: 'text',
      label: '메인 텍스트',
      required: true,
      admin: {
        description: '배너에 표시될 주요 문구 (예: 🌟 부활절 특별예배)',
      },
    },
    {
      name: 'subtext',
      type: 'text',
      label: '서브 텍스트',
      admin: {
        description: '추가 안내 문구 (예: 4월 5일 (토) 오전 10:30)',
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: '배경색',
      defaultValue: '#1B3A2D',
      admin: {
        description: 'CSS 색상값 (예: #1B3A2D, rgb(27,58,45))',
      },
    },
    {
      name: 'textColor',
      type: 'text',
      label: '글자색',
      defaultValue: 'white',
      admin: {
        description: 'CSS 색상값 (예: white, #FFFFFF)',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      label: '시작일',
      admin: {
        description: '배너 표시 시작일 (비워두면 즉시 표시)',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: '종료일',
      required: true,
      admin: {
        description: '배너 표시 종료일 (이 날짜가 지나면 자동으로 숨겨집니다)',
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
  ],
}
