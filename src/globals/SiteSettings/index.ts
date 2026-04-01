import type { GlobalConfig } from 'payload'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '사이트 설정',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
  fields: [
    // ─── 히어로 ───────────────────────────────────────────────
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

    // ─── 예배 시간 ────────────────────────────────────────────
    {
      name: 'sundayServiceTime',
      type: 'text',
      label: '주일예배 시간',
      defaultValue: '12:00',
      admin: {
        description: '예: 12:00 또는 오전 11시',
      },
    },
    {
      name: 'fridayServiceTime',
      type: 'text',
      label: '금요기도회 시간',
      defaultValue: '20:00',
      admin: {
        description: '예: 20:00 또는 저녁 8시',
      },
    },

    // ─── 위치 정보 ────────────────────────────────────────────
    {
      name: 'address',
      type: 'text',
      label: '주소',
      defaultValue: '위례서일로 3길 21-4',
    },
    {
      name: 'addressDetail',
      type: 'text',
      label: '상세 주소 (건물명 등)',
      defaultValue: 'BELOVED LOUNGE',
    },
    {
      name: 'transitInfo',
      type: 'text',
      label: '교통편 안내',
      defaultValue: '남위례역 근처, 도보 약 5분 거리',
    },
    {
      name: 'mapLat',
      type: 'number',
      label: '지도 위도',
      defaultValue: 37.4697,
    },
    {
      name: 'mapLng',
      type: 'number',
      label: '지도 경도',
      defaultValue: 127.1489,
    },

    // ─── 교회 소개 ────────────────────────────────────────────
    {
      name: 'churchDescription',
      type: 'textarea',
      label: '교회 소개 (첫 문장)',
      defaultValue:
        '사랑하는교회는 기독교대한감리회 소속으로, 위례 신도시에서 하나님의 말씀을 중심으로 모이는 공동체입니다.',
    },
    {
      name: 'churchVision',
      type: 'text',
      label: '비전',
      defaultValue: 'Like Christ (그리스도를 본받아)',
    },
    {
      name: 'churchQuote',
      type: 'text',
      label: '인용 문구',
      defaultValue: '사랑 안에서 진리를 말하고, 그리스도 안에서 함께 자라가는 교회',
    },
    {
      name: 'denomination',
      type: 'text',
      label: '교단',
      defaultValue: '기독교대한감리회',
    },

    // ─── 헌금 안내 ────────────────────────────────────────────
    {
      name: 'offeringBankName',
      type: 'text',
      label: '헌금 은행명',
      admin: {
        description: '헌금 계좌 은행 이름 (예: 국민은행)',
      },
    },
    {
      name: 'offeringAccountNumber',
      type: 'text',
      label: '헌금 계좌번호',
      admin: {
        description: '헌금 계좌번호 (예: 123-456-789012)',
      },
    },
    {
      name: 'offeringAccountHolder',
      type: 'text',
      label: '헌금 예금주',
      admin: {
        description: '헌금 계좌 예금주 이름 (예: 사랑하는교회)',
      },
    },
    {
      name: 'offeringKakaoPayQr',
      type: 'upload',
      relationTo: 'media',
      label: '카카오페이 QR 코드 (선택)',
      admin: {
        description: '카카오페이 송금용 QR 코드 이미지 (선택 사항)',
      },
    },
    {
      name: 'offeringNotes',
      type: 'textarea',
      label: '헌금 안내 메시지 (선택)',
      admin: {
        description: '헌금 관련 추가 안내 사항 (예: 입금 시 성명을 남겨주세요)',
      },
    },

    // ─── 특별 배너 ────────────────────────────────────────────
    {
      name: 'specialBanner',
      type: 'group',
      label: '특별 기간 배너',
      admin: {
        description: '부활절, 성탄절 등 특별 기간에 상단에 표시할 배너',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: '배너 활성화',
          defaultValue: false,
          admin: {
            description: '체크하면 홈페이지 상단에 배너가 표시됩니다',
          },
        },
        {
          name: 'title',
          type: 'text',
          label: '배너 제목',
          admin: {
            description: '예: 🌟 부활절 특별예배',
            condition: (data) => data.specialBanner?.enabled,
          },
        },
        {
          name: 'message',
          type: 'text',
          label: '배너 메시지',
          admin: {
            description: '예: 4월 5일 오전 10:30',
            condition: (data) => data.specialBanner?.enabled,
          },
        },
        {
          name: 'backgroundColor',
          type: 'select',
          label: '배경 색상',
          defaultValue: 'primary',
          options: [
            { label: '주 색상 (진한 녹색)', value: 'primary' },
            { label: '금색', value: 'gold' },
            { label: '어두운 녹색', value: 'dark' },
          ],
          admin: {
            condition: (data) => data.specialBanner?.enabled,
          },
        },
        {
          name: 'link',
          type: 'text',
          label: '배너 클릭 시 이동할 URL (선택)',
          admin: {
            description: '예: /about 또는 외부 링크',
            condition: (data) => data.specialBanner?.enabled,
          },
        },
      ],
    },
  ],
}
