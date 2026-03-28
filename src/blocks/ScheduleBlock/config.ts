import type { Block } from 'payload'

export const ScheduleBlock: Block = {
  slug: 'scheduleBlock',
  labels: { singular: '시간표', plural: '시간표' },
  fields: [
    { name: 'title', type: 'text', label: '제목' },
    {
      name: 'items',
      type: 'array',
      label: '일정 항목',
      fields: [
        {
          name: 'dayTime',
          type: 'text',
          required: true,
          label: '요일/시간 (예: 주일 오전 11시)',
        },
        { name: 'name', type: 'text', required: true, label: '예배/모임 이름' },
        { name: 'location', type: 'text', label: '장소' },
        { name: 'description', type: 'text', label: '설명' },
      ],
    },
  ],
}
