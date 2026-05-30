import type { GlobalConfig } from 'payload'

import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

const colorPickerField = {
  components: {
    Field: '@/components/admin/ColorPickerField#ColorPickerField',
  },
}

const homeSectionOptions = [
  { label: '교회소개 - 교회 정보 내용을 홈에 보여줍니다', value: 'intro' },
  { label: '공지사항 - 최근 공지를 홈에 보여줍니다', value: 'announcements' },
  { label: '최신 설교 - YouTube/설교영상을 홈에 보여줍니다', value: 'sermons' },
  { label: '인스타그램 - SNS 게시물을 홈에 보여줍니다', value: 'instagram' },
  { label: '오시는 길 - 주소와 지도를 홈에 보여줍니다', value: 'map' },
]

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '홈페이지 빌더',
  admin: {
    description:
      '홈 메인 화면을 섹션 단위로 편집하고, 교회 정보/예배/디자인/SNS 설정을 관리합니다.',
    group: '1. 홈페이지 편집',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '홈 빌더',
          fields: [
            {
              type: 'collapsible',
              label: '1. 히어로 편집',
              admin: {
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'homeHeroPreview',
                  type: 'ui',
                  label: '히어로 미리보기',
                  admin: {
                    components: {
                      Field: '@/components/admin/HomeHeroInlinePreview#HomeHeroInlinePreview',
                    },
                  },
                },
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
                  type: 'row',
                  fields: [
                    {
                      name: 'heroEyebrow',
                      type: 'text',
                      label: '작은 제목',
                      defaultValue: 'Beloved Church Wirye',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'heroTitle',
                      type: 'text',
                      label: '제목',
                      defaultValue: '사랑하는교회',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'heroSubtitle',
                  type: 'text',
                  label: '부제목',
                  defaultValue: '위례에서 하나님의 사랑을 나누는 공동체',
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'heroPrimaryLabel',
                      type: 'text',
                      label: '기본 버튼 문구',
                      defaultValue: '예배안내',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'heroPrimaryUrl',
                      type: 'text',
                      label: '기본 버튼 링크',
                      defaultValue: '/worship',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'heroSecondaryLabel',
                      type: 'text',
                      label: '보조 버튼 문구',
                      defaultValue: '최신 설교 보기',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'heroSecondaryUrl',
                      type: 'text',
                      label: '보조 버튼 링크',
                      defaultValue: '/sermon',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'homeSections',
              type: 'array',
              label: '2. 섹션 편집',
              admin: {
                description:
                  '각 섹션 카드 안에서 홈에 보이는 형태를 보면서 바로 수정합니다. 행 추가/삭제로 섹션을 추가하거나 제거하고, 드래그로 순서를 바꿉니다.',
                initCollapsed: false,
                components: {
                  RowLabel: '@/components/admin/HomeSectionRowLabel#HomeSectionRowLabel',
                },
              },
              fields: [
                {
                  name: 'sectionInlinePreview',
                  type: 'ui',
                  label: '섹션 미리보기',
                  admin: {
                    components: {
                      Field: '@/components/admin/HomeSectionInlinePreview#HomeSectionInlinePreview',
                    },
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      label: '홈에 표시',
                      defaultValue: true,
                      admin: { width: '30%' },
                    },
                    {
                      name: 'sectionType',
                      type: 'select',
                      label: '섹션 역할',
                      required: true,
                      options: homeSectionOptions,
                      admin: {
                        description:
                          '섹션 역할은 어떤 콘텐츠를 가져올지 결정합니다. 예: 공지사항 섹션은 공지사항 게시글을 가져옵니다.',
                        width: '70%',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'eyebrow',
                      type: 'text',
                      label: '작은 제목',
                      admin: {
                        description: '예: ABOUT US, NOTICE, SERMON처럼 제목 위에 작게 표시됩니다.',
                        width: '40%',
                      },
                    },
                    {
                      name: 'title',
                      type: 'text',
                      label: '섹션 제목',
                      admin: { width: '60%' },
                    },
                  ],
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: '섹션 설명/용도',
                  admin: {
                    description:
                      '홈 화면에 표시되는 설명 문구입니다. 비워두면 해당 섹션의 기본 구성만 표시합니다.',
                  },
                },
              ],
              defaultValue: [
                {
                  enabled: true,
                  sectionType: 'intro',
                  eyebrow: 'ABOUT US',
                  title: '그리스도를 본받아 함께 사랑하는 공동체',
                },
                {
                  enabled: true,
                  sectionType: 'announcements',
                  eyebrow: 'NOTICE',
                  title: '교회 소식',
                },
                { enabled: true, sectionType: 'sermons', eyebrow: 'SERMON', title: '최신 설교' },
                {
                  enabled: true,
                  sectionType: 'instagram',
                  eyebrow: 'INSTAGRAM',
                  title: '인스타그램',
                },
                { enabled: true, sectionType: 'map', eyebrow: 'LOCATION', title: '오시는 길' },
              ],
            },
          ],
        },
        {
          label: '교회 정보',
          fields: [
            {
              name: 'churchName',
              type: 'text',
              label: '교회명',
              required: true,
              defaultValue: '사랑하는교회',
            },
            {
              name: 'englishName',
              type: 'text',
              label: '영문명',
              defaultValue: 'Beloved Church Wirye',
            },
            {
              name: 'tagline',
              type: 'text',
              label: '대표 문구',
              defaultValue: '우리는 사랑으로 교회를 세웁니다',
            },
            {
              name: 'subTagline',
              type: 'text',
              label: '보조 문구',
              defaultValue: '더불어 우리의 삶 속에 하나님 나라를 세웁니다',
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: '로고',
              admin: {
                description:
                  'Header와 히어로에 사용할 로고입니다. 비워두면 기본 로고 파일을 사용합니다.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'headerLogoHeight',
                  type: 'number',
                  label: '상단 로고 크기',
                  defaultValue: 40,
                  min: 24,
                  max: 96,
                  admin: {
                    description: 'GNB에 표시되는 로고 높이(px)입니다. 기본값은 40입니다.',
                    width: '50%',
                  },
                },
                {
                  name: 'headerLogoInvert',
                  type: 'checkbox',
                  label: '상단 로고 색상 반전',
                  defaultValue: true,
                  admin: {
                    description:
                      '어두운 상단 배경에서 흰색 로고처럼 보여야 하면 켜두세요. 원본 색상을 그대로 쓰려면 끕니다.',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'denomination',
              type: 'text',
              label: '교단',
              defaultValue: '기독교대한감리회',
            },
            {
              name: 'churchDescription',
              type: 'textarea',
              label: '교회소개',
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
              name: 'coreValues',
              type: 'array',
              label: '핵심 가치',
              admin: {
                initCollapsed: true,
              },
              fields: [
                { name: 'title', type: 'text', label: '제목', required: true },
                { name: 'description', type: 'textarea', label: '설명', required: true },
              ],
              defaultValue: [
                {
                  title: '말씀 중심',
                  description: '성경 말씀을 삶의 기준으로 삼아 신앙과 삶을 일치시킵니다.',
                },
                {
                  title: '예배와 기도',
                  description: '하나님께 영광 돌리는 예배와 간절한 기도로 신앙을 성장시킵니다.',
                },
                {
                  title: '사랑과 섬김',
                  description: '그리스도의 사랑으로 서로를 섬기고 이웃에게 복음을 전합니다.',
                },
              ],
            },
            {
              name: 'pastorName',
              type: 'text',
              label: '담임목사 이름',
              defaultValue: '차원석 목사',
            },
            {
              name: 'pastorTitle',
              type: 'text',
              label: '담임목사 직함',
              defaultValue: '사랑하는교회 담임목사',
            },
            {
              name: 'pastorPhoto',
              type: 'upload',
              relationTo: 'media',
              label: '담임목사 사진',
            },
            {
              name: 'pastorBio',
              type: 'textarea',
              label: '담임목사 소개',
              defaultValue:
                '연세대학교 일반대학원 박사과정(Ph.D) 재학\n감리교신학대학교 및 대학원(Th.M) 졸업\n前 만나교회 부목사',
            },
            {
              name: 'pastorQuote',
              type: 'text',
              label: '담임목사 인용 문구',
              defaultValue: '우리는 사랑으로 교회를 세웁니다.',
            },
            {
              name: 'visitorNotes',
              type: 'array',
              label: '처음 오시는 분 안내',
              admin: {
                initCollapsed: true,
              },
              fields: [{ name: 'text', type: 'text', label: '안내 문구', required: true }],
              defaultValue: [
                { text: '주차는 인근 공영주차장을 이용해 주세요.' },
                { text: '어린이를 위한 별도 프로그램이 준비되어 있습니다.' },
                { text: '복장은 편하게 오시면 됩니다.' },
                { text: '처음 방문하시는 분은 안내 데스크를 찾아주세요.' },
              ],
            },
          ],
        },
        {
          label: '예배/오시는 길',
          fields: [
            {
              name: 'worshipServices',
              type: 'array',
              label: '예배/모임 시간',
              admin: {
                initCollapsed: true,
              },
              fields: [
                { name: 'name', type: 'text', label: '이름', required: true },
                { name: 'time', type: 'text', label: '시간', required: true },
                { name: 'description', type: 'textarea', label: '설명' },
              ],
              defaultValue: [
                {
                  name: '청·장년예배',
                  time: '주일 낮 12시',
                  description: '말씀과 찬양으로 하나님께 영광을 돌립니다.',
                },
                {
                  name: '어린이예배',
                  time: '주일 낮 12시',
                  description: '다음 세대가 함께 예배합니다.',
                },
                {
                  name: '금요기도회',
                  time: '금요일 밤 8시',
                  description: '함께 모여 기도하며 하나님의 임재를 구합니다.',
                },
                {
                  name: '매일 큐티',
                  time: '월-금 새벽 6시 (온라인)',
                  description: '말씀으로 하루를 시작합니다.',
                },
              ],
            },
            {
              name: 'worshipOrder',
              type: 'array',
              label: '예배 순서',
              admin: {
                initCollapsed: true,
              },
              fields: [
                { name: 'title', type: 'text', label: '순서명', required: true },
                { name: 'description', type: 'text', label: '설명' },
              ],
              defaultValue: [
                { title: '예배 준비 및 묵상', description: '마음을 준비하며 하나님을 기다립니다.' },
                { title: '찬양', description: '찬양으로 하나님께 영광을 돌립니다.' },
                { title: '기도', description: '공동체의 기도 제목을 함께 나눕니다.' },
                { title: '말씀', description: '성경 말씀을 듣고 묵상합니다.' },
                { title: '헌금', description: '감사함으로 하나님께 드립니다.' },
                { title: '축도', description: '하나님의 축복을 받으며 마칩니다.' },
              ],
            },
            {
              name: 'address',
              type: 'text',
              label: '주소',
              defaultValue: '위례서일로 3길 21-4',
            },
            {
              name: 'addressDetail',
              type: 'text',
              label: '상세 주소',
              defaultValue: 'BELOVED LOUNGE',
            },
            {
              name: 'transitInfo',
              type: 'textarea',
              label: '교통편 안내',
              defaultValue: '남위례역 근처, 도보 약 5분 거리',
            },
            {
              name: 'parkingInfo',
              type: 'textarea',
              label: '주차 안내',
              defaultValue: '주변 공영주차장을 이용하실 수 있습니다.',
            },
            {
              name: 'mapLat',
              type: 'number',
              label: '지도 위도',
              defaultValue: 37.467,
            },
            {
              name: 'mapLng',
              type: 'number',
              label: '지도 경도',
              defaultValue: 127.1395,
            },
          ],
        },
        {
          label: '디자인',
          fields: [
            {
              name: 'design',
              type: 'group',
              label: '디자인 설정',
              admin: {
                description:
                  '색상 칸을 눌러 컬러피커로 선택하거나 HEX 값을 직접 입력할 수 있습니다.',
              },
              fields: [
                {
                  name: 'designPreview',
                  type: 'ui',
                  label: '디자인 미리보기',
                  admin: {
                    components: {
                      Field: '@/components/admin/DesignPreview#DesignPreview',
                    },
                  },
                },
                {
                  name: 'primaryColor',
                  type: 'text',
                  label: '메인 컬러',
                  defaultValue: '#123125',
                  admin: colorPickerField,
                },
                {
                  name: 'primaryLightColor',
                  type: 'text',
                  label: '메인 밝은 컬러',
                  defaultValue: '#1c4938',
                  admin: colorPickerField,
                },
                {
                  name: 'secondaryColor',
                  type: 'text',
                  label: '강조 컬러',
                  defaultValue: '#f3ead6',
                  admin: colorPickerField,
                },
                {
                  name: 'backgroundColor',
                  type: 'text',
                  label: '전체 배경 컬러',
                  defaultValue: '#f7f8f6',
                  admin: colorPickerField,
                },
                {
                  name: 'sectionBackgroundColor',
                  type: 'text',
                  label: '밝은 섹션 배경 컬러',
                  defaultValue: '#f7f8f6',
                  admin: colorPickerField,
                },
                {
                  name: 'darkSectionBackgroundColor',
                  type: 'text',
                  label: '어두운 섹션 배경 컬러',
                  defaultValue: '#143c2e',
                  admin: colorPickerField,
                },
                {
                  name: 'cardBackgroundColor',
                  type: 'text',
                  label: '카드 배경 컬러',
                  defaultValue: '#ffffff',
                  admin: colorPickerField,
                },
                {
                  name: 'textColor',
                  type: 'text',
                  label: '본문 텍스트 컬러',
                  defaultValue: '#171a17',
                  admin: colorPickerField,
                },
                {
                  name: 'mutedTextColor',
                  type: 'text',
                  label: '보조 텍스트 컬러',
                  defaultValue: '#5d675f',
                  admin: colorPickerField,
                },
                {
                  name: 'borderColor',
                  type: 'text',
                  label: '테두리 컬러',
                  defaultValue: '#d9ded6',
                  admin: colorPickerField,
                },
                {
                  name: 'headerBackgroundColor',
                  type: 'text',
                  label: 'Header 배경 컬러',
                  defaultValue: '#123125',
                  admin: colorPickerField,
                },
                {
                  name: 'footerBackgroundColor',
                  type: 'text',
                  label: 'Footer 배경 컬러',
                  defaultValue: '#143c2e',
                  admin: colorPickerField,
                },
                {
                  name: 'heroOverlayColor',
                  type: 'text',
                  label: '히어로 오버레이 컬러',
                  defaultValue: '#0a1c15',
                  admin: colorPickerField,
                },
                {
                  name: 'heroOverlayOpacity',
                  type: 'number',
                  label: '히어로 오버레이 불투명도',
                  defaultValue: 82,
                  min: 0,
                  max: 100,
                  admin: {
                    description: '0은 투명, 100은 완전 불투명입니다.',
                  },
                },
                {
                  name: 'showHeroPattern',
                  type: 'checkbox',
                  label: '히어로 패턴 표시',
                  defaultValue: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'heroTitleFontSize',
                      type: 'number',
                      label: '히어로 제목 크기(px)',
                      defaultValue: 88,
                      min: 36,
                      max: 128,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'heroSubtitleFontSize',
                      type: 'number',
                      label: '히어로 부제목 크기(px)',
                      defaultValue: 30,
                      min: 16,
                      max: 64,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'sectionTitleFontSize',
                      type: 'number',
                      label: '섹션 제목 크기(px)',
                      defaultValue: 48,
                      min: 24,
                      max: 80,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'bodyFontSize',
                      type: 'number',
                      label: '본문 크기(px)',
                      defaultValue: 16,
                      min: 13,
                      max: 24,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'pageBackgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: '전체 페이지 배경 이미지',
                  admin: {
                    description: '은은한 텍스처나 패턴용입니다. 비워두면 배경 컬러만 사용합니다.',
                  },
                },
                {
                  name: 'darkSectionBackgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: '어두운 섹션 배경 이미지',
                  admin: {
                    description: 'Instagram 같은 어두운 섹션에 사용할 배경 이미지입니다.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'SNS/자동 연동',
          fields: [
            {
              name: 'youtubeChannelUrl',
              type: 'text',
              label: 'YouTube 채널 URL',
              defaultValue: 'https://www.youtube.com/@BelovedChurchWirye',
            },
            {
              name: 'youtubeChannelId',
              type: 'text',
              label: 'YouTube 채널 ID',
              admin: {
                description:
                  '비워도 채널 URL에서 자동 해석을 시도합니다. UC로 시작하는 채널 ID를 넣으면 더 안정적입니다.',
              },
            },
            {
              name: 'youtubeVideoCount',
              type: 'number',
              label: '홈에 표시할 YouTube 영상 수',
              defaultValue: 4,
              min: 1,
              max: 12,
            },
            {
              name: 'instagramUrl',
              type: 'text',
              label: 'Instagram URL',
              defaultValue: 'https://www.instagram.com/beloved_ch_/',
            },
            {
              name: 'instagramHandle',
              type: 'text',
              label: 'Instagram 계정명',
              defaultValue: '@beloved_ch_',
            },
            {
              name: 'instagramPosts',
              type: 'array',
              label: 'Instagram 임베드 게시물',
              admin: {
                description:
                  'Instagram API 제약 때문에 안정 운영은 게시물 ID를 관리자가 등록하는 방식으로 시작합니다.',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  label: '종류',
                  required: true,
                  defaultValue: 'p',
                  options: [
                    { label: '게시물', value: 'p' },
                    { label: '릴스', value: 'reel' },
                  ],
                },
                {
                  name: 'postId',
                  type: 'text',
                  label: '게시물 ID',
                  required: true,
                  admin: {
                    description: '예: https://www.instagram.com/p/POST_ID/ 에서 POST_ID 부분',
                  },
                },
                {
                  name: 'caption',
                  type: 'textarea',
                  label: '캡션/제목',
                  admin: {
                    description:
                      '홈 카드에 표시할 게시물 설명입니다. 공식 API 동기화 시 Instagram 캡션을 저장합니다.',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'publishedAt',
                      type: 'date',
                      label: '게시일',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'hashtags',
                      type: 'text',
                      label: '해시태그',
                      admin: {
                        description: '예: #주일예배 #사랑하는교회',
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  name: 'thumbnail',
                  type: 'upload',
                  relationTo: 'media',
                  label: '썸네일 이미지',
                  admin: {
                    description:
                      '홈 화면 Instagram 카드에 표시할 이미지입니다. 비워두면 기본 카드 디자인으로 표시됩니다.',
                  },
                },
                {
                  name: 'thumbnailUrl',
                  type: 'text',
                  label: '자동 동기화 썸네일 URL',
                  admin: {
                    description:
                      'Instagram 자동 동기화가 미디어 저장소에 이미지를 업로드할 수 없을 때 임시로 사용하는 외부 이미지 URL입니다.',
                  },
                },
              ],
              defaultValue: [
                { type: 'reel', postId: 'DWbIfyUEd8c' },
                { type: 'p', postId: 'DWaDbrdET7G' },
                { type: 'reel', postId: 'DWVRcsAkbEr' },
                { type: 'reel', postId: 'DWK2nuZER5k' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'offeringBankName',
      type: 'text',
      label: '헌금 은행명',
      admin: { hidden: true },
    },
    {
      name: 'offeringAccountNumber',
      type: 'text',
      label: '헌금 계좌번호',
      admin: { hidden: true },
    },
    {
      name: 'offeringAccountHolder',
      type: 'text',
      label: '헌금 예금주',
      admin: { hidden: true },
    },
    {
      name: 'offeringKakaoPayQr',
      type: 'upload',
      relationTo: 'media',
      label: '카카오페이 QR 코드',
      admin: { hidden: true },
    },
    {
      name: 'offeringNotes',
      type: 'textarea',
      label: '헌금안내 메시지',
      admin: { hidden: true },
    },
  ],
}
