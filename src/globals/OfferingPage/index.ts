import type { GlobalConfig } from 'payload'

export const OfferingPage: GlobalConfig = {
  slug: 'offering-page',
  label: '헌금 안내 페이지',
  admin: {
    description: '헌금 안내 페이지의 문구, 계좌, 안내 사항을 관리합니다.',
    group: '1. 홈페이지 편집',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    // ─── 인트로 ───────────────────────────────────────────────
    {
      name: 'introText',
      type: 'textarea',
      label: '소개 문구',
      defaultValue:
        '헌금은 하나님께 드리는 감사와 헌신의 표현입니다.\n여러분의 귀한 헌금은 복음 전파와 교회 사역에 사용됩니다.',
      admin: {
        description: '헌금 안내 페이지 상단에 표시되는 소개 문구',
      },
    },

    // ─── 은행 계좌 ────────────────────────────────────────────
    {
      name: 'bankAccounts',
      type: 'array',
      label: '계좌 정보',
      minRows: 1,
      fields: [
        {
          name: 'bankName',
          type: 'text',
          label: '은행명',
          required: true,
        },
        {
          name: 'accountNumber',
          type: 'text',
          label: '계좌번호',
          required: true,
        },
        {
          name: 'accountHolder',
          type: 'text',
          label: '예금주',
          required: true,
        },
      ],
      defaultValue: [
        {
          bankName: '국민은행',
          accountNumber: '123-456-7890',
          accountHolder: '사랑하는교회',
        },
      ],
    },

    // ─── 안내 사항 ────────────────────────────────────────────
    {
      name: 'notes',
      type: 'textarea',
      label: '안내 사항',
      defaultValue:
        '- 헌금은 예배 시간에 직접 드리거나 계좌 이체로 가능합니다.\n- 입금 시 이름을 명시해 주시면 감사하겠습니다.\n- 문의사항은 교회 사무실로 연락 주시기 바랍니다.',
      admin: {
        description: '헌금 관련 안내 사항 (줄바꿈으로 항목 구분)',
      },
    },

    // ─── 성경 구절 ────────────────────────────────────────────
    {
      name: 'bibleVerse',
      type: 'textarea',
      label: '성경 구절',
      defaultValue:
        '각각 그 마음에 정한 대로 할 것이요 인색함으로나 억지로 하지 말지니\n하나님은 즐겨 내는 자를 사랑하시느니라',
    },
    {
      name: 'bibleReference',
      type: 'text',
      label: '성경 구절 출처',
      defaultValue: '고린도후서 9:7',
    },

    // ─── 헌금 종류 ────────────────────────────────────────────
    {
      name: 'offeringTypes',
      type: 'array',
      label: '헌금의 종류',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: '종류',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: '설명',
          required: true,
        },
      ],
      defaultValue: [
        {
          title: '십일조',
          description: '소득의 십분의 일을 하나님께 드리는 헌금',
        },
        {
          title: '주정헌금',
          description: '주일예배 시 정기적으로 드리는 헌금',
        },
        {
          title: '감사헌금',
          description: '하나님의 은혜에 감사하며 드리는 헌금',
        },
      ],
    },
  ],
}
