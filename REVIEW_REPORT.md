# 코드 리뷰 리포트

---

## 2026-03-31 23:30 UTC

### 리뷰 범위
커밋 38b785e ~ 18440b2 (최신 3개 커밋)

---

## ⚠️ **중대한 CMS 원칙 위배 발견**

### 커밋 18440b2 - YouTube 기반 설교 페이지 구현

**파일:**
- `src/app/(frontend)/sermon/page.tsx` (신규, 204줄)
- `src/lib/youtube.ts` (신규, YouTube RSS 파싱)
- `scripts/fix-sermon-page.ts` (참고용 스크립트)

**문제점:** 🚨 **CMS 우선 원칙을 정면으로 위배하는 코드 기반 구현**

---

### 📋 구현 내용
- 설교 페이지를 Payload CMS 기반에서 **완전히 코드 기반으로 전환**
- YouTube RSS feed를 직접 파싱하여 영상 목록 표시
- 204줄의 하드코딩된 React 컴포넌트
- "Rick Astley 버그" 해결을 위해 CMS 의존성을 제거

---

### 🚨 CMS 원칙 위배 사항

#### 1. CMS로 구성 가능한 것을 코드로 하드코딩 (심각)
**원칙:**
> CMS(Payload)로 구성 가능한 건 무조건 CMS로 구현

**위배 내용:**
```tsx
// 하드코딩된 UI 요소들
<h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
  설교
</h1>
<p className="text-lg text-muted-foreground">
  하나님의 말씀을 나눕니다.
</p>

// 하드코딩된 YouTube 채널 링크
<a href="https://www.youtube.com/@BelovedChurchWirye" ...>
  YouTube 채널에서 더 많은 설교 보기
</a>
```

**CMS로 가능한 것:**
- ✅ 페이지 제목/부제목 → Pages 컬렉션의 `hero` 필드
- ✅ YouTube 채널 URL → Global Settings
- ✅ 영상 목록 레이아웃 → Content Block
- ✅ CTA 버튼 텍스트 → RichText 또는 Link Block

#### 2. Content Block 없이 직접 데이터 fetching (심각)
**문제:**
- YouTube RSS를 코드에서 직접 파싱
- CMS 관리자가 영상 순서, 표시 여부, 썸네일을 제어할 수 없음
- 콘텐츠 변경 시 코드 배포 필요

**올바른 접근:**
- Payload `Videos` 컬렉션 생성 → YouTube URL 저장
- `YouTubeBlock` 사용 → 관리자가 CMS에서 영상 관리
- 또는 Global Settings에 `featuredVideoId` 필드 추가

#### 3. 204줄의 프레젠테이션 로직 하드코딩 (심각)
**문제:**
- Grid 레이아웃, 스타일, 구조가 모두 코드에 고정됨
- 디자인 변경 시 개발자가 코드를 수정해야 함
- A/B 테스트, 계절별 레이아웃 변경 불가능

**올바른 접근:**
- `MediaBlock` + `ContentBlock` 조합으로 레이아웃 구성
- CMS 관리자가 Drag & Drop으로 블록 배치
- 컴포넌트는 최소한의 렌더링 로직만 포함

---

### 📊 코드 품질 분석

#### ✅ 좋은 점 (기술적 구현)
1. **에러 핸들링**: RSS fetch 실패 시 빈 배열 반환
2. **타입 안전성**: `YouTubeVideo` 인터페이스 정의
3. **캐싱 전략**: `revalidate: 43200` (12시간)으로 ISR 활용
4. **접근성**: 
   - `alt` 텍스트, `aria-hidden` 적절히 사용
   - semantic HTML (`<article>`, `<time>`, `<section>`)
5. **UX**: 
   - 응답형 디자인 (grid responsive)
   - hover 상태 애니메이션
   - Empty state 처리
6. **성능**: 
   - `next/image` 최적화
   - `sizes` 속성으로 responsive image loading

#### ⚠️ 기술적 개선 사항

##### 1. 하드코딩된 상수 (중요도: 중)
```typescript
// src/lib/youtube.ts
const CHANNEL_ID = 'UCEyfzJVbYFdI9An9e0FTojw'
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`
```

**권장:**
```typescript
// globals/SiteSettings.ts
{
  name: 'youtubeChannelId',
  type: 'text',
  defaultValue: 'UCEyfzJVbYFdI9An9e0FTojw',
  label: 'YouTube 채널 ID',
}

// src/lib/youtube.ts
const settings = await payload.findGlobal({ slug: 'site-settings' })
const CHANNEL_ID = settings.youtubeChannelId
```

##### 2. 브랜드 색상 하드코딩 (중요도: 중)
```tsx
className="bg-[#1B3A2D] text-white"
className="text-[#C9A84C]"
```

**권장:** Tailwind config에 등록 (이전 리뷰에서도 지적됨)

##### 3. 텍스트 하드코딩 (중요도: 높)
```tsx
<h1>설교</h1>
<p>하나님의 말씀을 나눕니다.</p>
<a>YouTube 채널에서 더 많은 설교 보기</a>
```

**권장:** Global Settings 또는 Page metadata로 관리

##### 4. Empty state 개선 (중요도: 낮)
```tsx
{videos.length === 0 && (
  <div>설교 영상이 없습니다</div>
)}
```

**권장:**
- 로딩 상태 추가 (Suspense boundary)
- 에러 상태 구분 (네트워크 실패 vs 영상 없음)

---

### 🔧 올바른 구현 방법 (CMS 우선)

#### 방법 1: Payload 컬렉션 기반 (권장)
```typescript
// collections/Videos.ts
export const Videos: CollectionConfig = {
  slug: 'videos',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'youtubeVideoId',
      type: 'text',
      required: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'isFeatured'],
  },
}

// Page에서는 CMS 데이터만 fetch
const videos = await payload.find({
  collection: 'videos',
  sort: '-publishedAt',
  limit: 12,
})
```

**이점:**
- ✅ 관리자가 CMS에서 영상 순서 조정 가능
- ✅ 특정 영상 숨김/노출 제어
- ✅ 썸네일, 제목 커스터마이징 가능
- ✅ 코드 변경 없이 콘텐츠 업데이트

#### 방법 2: Global Settings + YouTubeBlock 조합
```typescript
// globals/SermonSettings.ts
{
  name: 'featuredSermonId',
  type: 'text',
  label: '대표 설교 YouTube ID',
}

// Page는 CMS Pages 컬렉션으로 구성
// Block: Hero + YouTubeBlock (featured) + MediaGrid
```

**이점:**
- ✅ 완전한 CMS 기반 관리
- ✅ 레이아웃 변경 시 코드 수정 불필요
- ✅ 다른 페이지에서도 블록 재사용 가능

#### 방법 3: Hook으로 자동 동기화 (고급)
```typescript
// collections/Videos.ts
hooks: {
  afterChange: [
    async ({ operation, req }) => {
      if (operation === 'create') {
        // YouTube RSS를 주기적으로 크롤링하여 DB 동기화
        // 또는 cron job으로 자동 업데이트
      }
    },
  ],
}
```

**이점:**
- ✅ 자동화 + CMS 제어 동시에 가능
- ✅ 관리자는 자동 동기화 결과 확인 후 수동 조정

---

### 🚫 "Rick Astley 버그" 해결 방법 (잘못된 접근)

**커밋 메시지:**
> Fixes Rick Astley video issue (6th recurrence) by eliminating CMS data dependency

**문제 분석:**
- CMS 데이터에 `dQw4w9WgXcQ` (Rick Roll 영상 ID)가 반복 생성됨
- 근본 원인: seed 스크립트 또는 마이그레이션 문제
- **잘못된 해결:** CMS를 아예 제거 → 원칙 위배

**올바른 해결:**
1. **Seed 스크립트 수정** (`fix-sermon-page.ts` 활용)
   ```typescript
   // 마이그레이션 시 Rick Astley 블록 자동 제거
   await payload.update({
     collection: 'pages',
     where: { slug: { equals: 'sermon' } },
     data: {
       layout: {
         $pull: { videoId: 'dQw4w9WgXcQ' }
       }
     }
   })
   ```

2. **CMS 검증 로직 추가**
   ```typescript
   // collections/Pages.ts hooks
   beforeChange: [
     async ({ data }) => {
       const hasRickRoll = data.layout?.some(
         block => block.videoId === 'dQw4w9WgXcQ'
       )
       if (hasRickRoll) {
         throw new Error('Rick Astley 영상은 등록할 수 없습니다')
       }
       return data
     }
   ]
   ```

3. **Admin UI에 경고 메시지**
   ```typescript
   admin: {
     description: '⚠️ 설교 페이지에는 공식 설교 영상만 등록해주세요',
   }
   ```

---

### 📝 커밋 38b785e - [slug] 페이지에서 sermon 라우트 제외

**파일:** `src/app/(frontend)/[slug]/page.tsx`

**변경 내용:**
```tsx
// generateStaticParams에서 sermon 제외
.filter((doc) => {
  return doc.slug !== 'home' && doc.slug !== 'sermon'
})

// 페이지 렌더링 시 sermon 리다이렉트
if (decodedSlug === 'sermon') {
  return <PayloadRedirects url={url} />
}
```

**리뷰:**
- ✅ **라우팅 충돌 방어**: Dynamic route가 `/sermon`을 덮어쓰는 것 방지
- ✅ **점진적 수정**: 18440b2 구현 후 필요한 보완 작업
- ⚠️ **임시방편**: CMS 기반으로 돌아가면 이 필터는 제거해야 함
- 💡 **패턴**: 향후 다른 dedicated route 추가 시 동일 패턴 적용 가능

**기술적 평가:**
- ✅ 올바른 라우팅 우선순위 처리
- ✅ SEO 문제 없음 (리다이렉트로 처리)
- ⚠️ 하지만 이 수정이 필요한 이유 자체가 CMS 원칙 위배에서 비롯됨

---

### 📝 커밋 3123abf - Vercel 캐시 클리어용 빌드 트리거

**변경 내용:** 빈 커밋 (chore)

**리뷰:**
- ✅ **운영 안정성**: 캐시 이슈 해결을 위한 실용적 접근
- 📝 **문서화 부족**: 어떤 캐시 문제를 해결하려 했는지 커밋 메시지에 없음
- 💡 **권장**: Vercel 대시보드에서 `Clear Cache` 버튼 활용 가능

---

## 종합 평가

### 🚨 중대한 문제
1. **CMS 우선 원칙 위배 (심각)**
   - 204줄의 코드 기반 설교 페이지 구현
   - CMS로 충분히 구성 가능한 콘텐츠를 하드코딩
   - "Rick Astley 버그"를 근본 원인 수정 대신 CMS 제거로 해결

2. **유지보수성 저하 (심각)**
   - 콘텐츠 변경 시 개발자 개입 필요
   - A/B 테스트, 레이아웃 변경 불가능
   - 다국어 지원 시 코드 중복 발생

3. **확장성 문제 (중요)**
   - 다른 페이지(주보, 공지)도 동일 패턴으로 하드코딩할 위험
   - CMS 블록 시스템의 재사용성 상실

### ✅ 기술적으로 잘된 점
1. **구현 품질**: TypeScript, 접근성, 캐싱, 에러 핸들링 우수
2. **UX**: 응답형 디자인, 애니메이션, Empty state 처리
3. **성능**: Next.js 최적화 (ISR, `next/image`) 적절히 활용
4. **라우팅 보완**: 38b785e에서 충돌 방지 처리

### 💡 필수 조치 사항 (우선순위순)

#### 1. 🔥 즉시 수정: sermon 페이지를 CMS 기반으로 전환 (P0)
**작업:**
1. `Videos` 컬렉션 생성 (또는 기존 `YouTubeBlock` 활용)
2. `/sermon` 페이지를 CMS `Pages` 컬렉션으로 되돌림
3. `src/app/(frontend)/sermon/page.tsx` 제거
4. `src/lib/youtube.ts` 제거 (또는 Hook으로 이동)
5. `[slug]/page.tsx`의 sermon 필터 제거

**예상 시간:** 2-3시간  
**우선순위:** P0 (CMS 원칙 복원)

#### 2. Rick Astley 버그 근본 원인 수정 (P0)
**작업:**
1. Seed 스크립트에서 `dQw4w9WgXcQ` 생성 코드 제거
2. 마이그레이션에 검증 로직 추가
3. Admin UI에 경고 메시지 추가
4. `fix-sermon-page.ts`를 마이그레이션으로 전환

**예상 시간:** 1시간  
**우선순위:** P0 (재발 방지)

#### 3. 하드코딩 제거 (P1)
**작업:**
1. 브랜드 색상 → Tailwind config
2. YouTube 채널 ID → Global Settings
3. 모든 텍스트 → CMS 또는 i18n 파일

**예상 시간:** 1-2시간  
**우선순위:** P1 (유지보수성)

#### 4. 테스트 추가 (P2)
**작업:**
1. E2E: `/sermon` 페이지 렌더링 테스트
2. Integration: CMS 데이터 fetch 테스트
3. Unit: YouTube RSS 파싱 테스트 (Hook으로 이동 시)

**예상 시간:** 2시간  
**우선순위:** P2 (품질 보증)

---

## 📊 코드 품질 점수

| 항목 | 점수 | 이유 |
|------|------|------|
| **CMS 원칙 준수** | 30/100 | sermon 페이지 코드 기반 구현 (심각한 위배) |
| **보안** | 95/100 | 접근 제어, 데이터 검증 양호 |
| **타입 안전성** | 90/100 | TypeScript strict 준수 |
| **접근성** | 90/100 | ARIA, semantic HTML 우수 |
| **성능** | 85/100 | ISR 활용, 이미지 최적화 (캐싱 전략 개선 가능) |
| **유지보수성** | 40/100 | 하드코딩 과다, CMS 우회 |
| **확장성** | 35/100 | 코드 기반 구현으로 확장 어려움 |

**종합:** 52/100 (기술적 구현은 우수하나 CMS 원칙 위배로 낙제)

---

## 🎯 권장 사항

### 단기 (1주 이내)
1. sermon 페이지를 CMS 기반으로 재구현 (P0)
2. Rick Astley 버그 근본 원인 수정 (P0)
3. 하드코딩된 상수들을 CMS/Config로 이동 (P1)

### 중기 (1개월 이내)
1. 다른 페이지들도 CMS 원칙 준수 여부 감사
2. Content Block 라이브러리 확장 (Video Grid Block 등)
3. 통합/E2E 테스트 추가

### 장기 (분기 단위)
1. CMS 관리자 교육 (Payload Admin 사용법)
2. 디자인 시스템 문서화 (Block 조합 가이드)
3. A/B 테스트 인프라 (CMS 기반 변형 관리)

---

**리뷰어:** church-reviewer  
**날짜:** 2026-03-31 23:30 UTC  
**리뷰 커밋 범위:** 38b785e ~ 18440b2

---

## 2026-04-01 00:35 UTC

### 리뷰 범위
커밋 30d5fd5 - feat: add OfferingBlock with SiteSettings integration for donation info (#7)

---

### 📋 기능 개요
헌금 안내 블록 시스템 구현:
- `OfferingBlock` 컴포넌트 (계좌 정보 + 카카오페이 QR)
- `SiteSettings` 글로벌에 헌금 관련 필드 추가
- Pages 컬렉션에 블록 등록

---

## ✅ **완벽한 CMS 우선 원칙 준수** 🎉

### 1. CMS 기반 설정 관리 (모범 사례)
**파일:** `src/globals/SiteSettings/index.ts`

```typescript
{
  name: 'offeringBankName',
  type: 'text',
  label: '헌금 은행명',
}
{
  name: 'offeringAccountNumber',
  type: 'text',
  label: '헌금 계좌번호',
}
{
  name: 'offeringAccountHolder',
  type: 'text',
  label: '헌금 예금주',
}
{
  name: 'offeringKakaoPayQr',
  type: 'upload',
  relationTo: 'media',
  label: '카카오페이 QR 코드 (선택)',
}
{
  name: 'offeringNotes',
  type: 'textarea',
  label: '헌금 안내 메시지 (선택)',
}
```

**✅ 매우 우수:**
- 헌금 정보를 CMS에서 완전히 관리 (코드 수정 불필요)
- 관리자가 Payload Admin에서 직접 업데이트 가능
- 다국어 지원 준비 (필드 구조만으로도 i18n 확장 가능)
- 미디어 업로드 타입으로 QR 코드 관리 (Payload의 이미지 최적화 활용)

---

### 2. Content Block 패턴 완벽 준수
**파일:** `src/blocks/OfferingBlock/config.ts`

```typescript
export const OfferingBlock: Block = {
  slug: 'offeringBlock',
  labels: { singular: '헌금 안내', plural: '헌금 안내' },
  interfaceName: 'OfferingBlock',
  fields: [
    { name: 'title', type: 'text', defaultValue: '헌금 안내' },
    { name: 'description', type: 'textarea' },
    { name: 'showBankInfo', type: 'checkbox', defaultValue: true },
    { name: 'showKakaoPay', type: 'checkbox', defaultValue: true },
  ],
}
```

**✅ 모범 사례:**
- 블록별 커스터마이징 가능 (제목, 설명, 표시 옵션)
- 체크박스로 계좌/카카오페이 선택적 표시 제어
- 관리자 친화적 한글 라벨 + 설명
- 재사용 가능한 구조 (여러 페이지에서 다른 설정으로 사용 가능)

---

### 3. 컴포넌트 구현 품질
**파일:** `src/blocks/OfferingBlock/Component.tsx`

#### ✅ 우수한 점

##### 3-1. CMS 데이터 fetch (서버 컴포넌트 활용)
```typescript
export const OfferingBlockComponent: React.FC<OfferingBlockProps> = async ({
  title, description, showBankInfo, showKakaoPay,
}) => {
  const payload = await getPayload({ config })
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
  })
```

**장점:**
- ✅ React Server Component로 서버 사이드 데이터 fetch
- ✅ `getPayload`로 타입 안전한 Payload 인스턴스 사용
- ✅ 글로벌 설정을 블록에서 직접 참조 (DRY 원칙)

##### 3-2. 안전한 데이터 검증
```typescript
const hasBankInfo =
  siteSettings?.offeringBankName ||
  siteSettings?.offeringAccountNumber ||
  siteSettings?.offeringAccountHolder

const hasKakaoPayQr =
  showKakaoPay && siteSettings?.offeringKakaoPayQr && typeof siteSettings.offeringKakaoPayQr === 'object'

if (!hasBankInfo && !hasKakaoPayQr) {
  return null
}
```

**장점:**
- ✅ **Early return**: 표시할 내용 없으면 빈 블록 렌더링 방지
- ✅ **타입 가드**: `typeof === 'object'`로 Media 타입 검증
- ✅ **Optional chaining**: `?.`로 안전하게 접근

##### 3-3. 응답형 레이아웃 + 접근성
```tsx
<div className="grid gap-6 md:grid-cols-2">
  <div className="space-y-2">
    <h4 className="font-medium text-gray-900">계좌 이체</h4>
    <div className="rounded-md bg-gray-50 p-4">
      {siteSettings.offeringBankName && (
        <p className="text-sm">
          <span className="font-medium">은행:</span> {siteSettings.offeringBankName}
        </p>
      )}
```

**장점:**
- ✅ **Grid 레이아웃**: 모바일 1열, 데스크톱 2열
- ✅ **조건부 렌더링**: 데이터가 있을 때만 표시
- ✅ **semantic HTML**: `<h3>`, `<h4>`, `<p>` 적절히 사용
- ✅ **가독성**: 라벨 + 콜론으로 정보 구조 명확

##### 3-4. Media 컴포넌트 활용
```tsx
<Media
  resource={siteSettings.offeringKakaoPayQr}
  imgClassName="mx-auto max-w-[200px]"
/>
```

**장점:**
- ✅ Payload의 `Media` 컴포넌트 재사용 (이미지 최적화 자동)
- ✅ `max-w-[200px]`로 QR 코드 크기 제한 (UX 고려)
- ✅ `mx-auto`로 중앙 정렬

##### 3-5. 추가 안내 메시지 (Blue Info Box)
```tsx
{siteSettings?.offeringNotes && (
  <div className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-900">
    {siteSettings.offeringNotes}
  </div>
)}
```

**장점:**
- ✅ **조건부 렌더링**: 메시지 있을 때만 표시
- ✅ **시각적 구분**: 파란색 배경으로 주의 메시지 강조
- ✅ **유연성**: CMS에서 자유롭게 메시지 변경 가능

---

### 4. TypeScript 타입 자동 생성 (payload-types.ts)
```typescript
export interface OfferingBlock {
  title?: string | null;
  description?: string | null;
  showBankInfo?: boolean | null;
  showKakaoPay?: boolean | null;
  id?: string | null;
  blockName?: string | null;
  blockType: 'offeringBlock';
}
```

**장점:**
- ✅ Payload CLI가 자동 생성 (`pnpm generate:types`)
- ✅ 타입 안전성 보장 (컴파일 타임 체크)
- ✅ IDE 자동완성 지원

---

## ⚠️ 개선 권장 사항

### 1. 하드코딩된 Tailwind 색상 (중요도: 중)
**현재:**
```tsx
className="text-primary"  // ✅ 좋음 (Tailwind 설정 활용)
className="text-gray-900" // ⚠️ 하드코딩
className="bg-gray-50"    // ⚠️ 하드코딩
className="bg-blue-50 text-blue-900" // ⚠️ 하드코딩
```

**권장:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'church-primary': '#1B3A2D',
        'church-accent': '#C9A84C',
        'church-info-bg': '#EFF6FF', // blue-50 대신
        'church-info-text': '#1E3A8A', // blue-900 대신
      }
    }
  }
}
```

또는 CMS 글로벌 설정으로 관리:
```typescript
// SiteSettings.ts
{
  name: 'offeringInfoBoxColor',
  type: 'select',
  options: [
    { label: '파란색', value: 'blue' },
    { label: '초록색', value: 'green' },
    { label: '노란색', value: 'yellow' },
  ],
  defaultValue: 'blue',
}
```

**이유:**
- 브랜드 색상 일관성 유지
- 디자인 시스템 확립
- 추후 다크 모드 지원 시 수월

---

### 2. 접근성 강화 (중요도: 중)
**현재:**
```tsx
<h4 className="font-medium text-gray-900">계좌 이체</h4>
<Media resource={...} imgClassName="..." />
```

**권장:**
```tsx
{/* 1. 섹션 구조 명시 */}
<section aria-labelledby="offering-title">
  <h3 id="offering-title" className="...">
    {title || '헌금 안내'}
  </h3>
  
  {/* 2. QR 코드 alt 텍스트 */}
  <Media
    resource={siteSettings.offeringKakaoPayQr}
    imgClassName="mx-auto max-w-[200px]"
    alt="카카오페이 헌금 QR 코드"
  />
  
  {/* 3. 계좌번호 복사 버튼 (선택 사항) */}
  <button
    onClick={() => navigator.clipboard.writeText(siteSettings.offeringAccountNumber)}
    aria-label="계좌번호 복사"
  >
    복사
  </button>
</section>
```

**이유:**
- 스크린 리더 사용자 지원
- WCAG 2.1 AA 준수
- 사용자 편의성 (계좌번호 복사 기능)

---

### 3. 에러 핸들링 강화 (중요도: 낮)
**현재:**
```typescript
const siteSettings = await payload.findGlobal({
  slug: 'site-settings',
})
// 에러 처리 없음
```

**권장:**
```typescript
try {
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
  })
  
  // ... 렌더링 로직
} catch (error) {
  console.error('Failed to fetch offering settings:', error)
  
  // 폴백 UI 렌더링
  return (
    <div className="my-8 rounded-lg bg-red-50 p-4 text-red-900">
      헌금 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
    </div>
  )
}
```

**이유:**
- DB 연결 실패 시 전체 페이지 렌더링 방지
- 사용자에게 명확한 피드백 제공
- 프로덕션 환경 안정성

---

### 4. 보안 고려 (중요도: 낮)
**현재:**
```tsx
{siteSettings.offeringAccountNumber && (
  <p>계좌번호: {siteSettings.offeringAccountNumber}</p>
)}
```

**잠재 이슈:**
- 계좌번호가 클라이언트 HTML에 평문 노출
- 크롤러/봇이 수집 가능

**권장 (선택 사항):**
```tsx
{/* 1. 일부 마스킹 */}
<p>
  계좌번호: {siteSettings.offeringAccountNumber.replace(/(\d{3})-(\d{3})-(\d{6})/, '$1-***-$3')}
  <button onClick={() => showFullAccountNumber()}>전체 보기</button>
</p>

{/* 2. 이미지로 렌더링 (OCR 방지) */}
{/* 3. 로그인한 회원에게만 표시 */}
```

**참고:**
- 현재 구현도 문제 없음 (교회는 공개 정보)
- 과도한 보안은 오히려 UX 저하
- 필요 시 추후 적용 고려

---

### 5. 테스트 추가 (중요도: 중)
**권장 테스트:**

#### 5-1. Integration Test
```typescript
// src/blocks/OfferingBlock/Component.test.tsx
describe('OfferingBlockComponent', () => {
  it('should render bank info when settings exist', async () => {
    const mockSettings = {
      offeringBankName: '국민은행',
      offeringAccountNumber: '123-456-789012',
      offeringAccountHolder: '사랑하는교회',
    }
    
    // Payload mock
    jest.spyOn(payload, 'findGlobal').mockResolvedValue(mockSettings)
    
    const { getByText } = render(<OfferingBlockComponent showBankInfo={true} />)
    expect(getByText('은행: 국민은행')).toBeInTheDocument()
  })
  
  it('should return null when no data available', async () => {
    jest.spyOn(payload, 'findGlobal').mockResolvedValue({})
    
    const { container } = render(<OfferingBlockComponent />)
    expect(container.firstChild).toBeNull()
  })
})
```

#### 5-2. E2E Test
```typescript
// e2e/offering.spec.ts
test('should display offering info on page with OfferingBlock', async ({ page }) => {
  await page.goto('/about')
  
  // CMS에서 OfferingBlock이 추가된 페이지로 이동
  await expect(page.locator('text=헌금 안내')).toBeVisible()
  await expect(page.locator('text=계좌 이체')).toBeVisible()
  await expect(page.locator('img[alt*="카카오페이"]')).toBeVisible()
})
```

---

## 📊 코드 품질 분석

### ✅ 장점
| 항목 | 점수 | 평가 |
|------|------|------|
| **CMS 원칙 준수** | 100/100 | 완벽한 CMS 기반 구현 🏆 |
| **보안 패턴** | 95/100 | 타입 가드, optional chaining 우수 |
| **타입 안전성** | 95/100 | Payload 타입 자동 생성 활용 |
| **컴포넌트 구조** | 90/100 | 재사용성, 모듈화 우수 |
| **UX/UI** | 90/100 | 응답형 디자인, 조건부 렌더링 |
| **성능** | 90/100 | 서버 컴포넌트, early return |
| **접근성** | 75/100 | semantic HTML 사용, ARIA 개선 가능 |

**종합:** 92/100 (매우 우수) 🎉

---

### ⚠️ sermon 페이지와 비교 (중요)
| 항목 | sermon 페이지 (18440b2) | OfferingBlock (30d5fd5) |
|------|-------------------------|-------------------------|
| **CMS 우선 원칙** | ❌ 30/100 (코드 기반) | ✅ 100/100 (CMS 기반) |
| **유지보수성** | ❌ 40/100 (하드코딩) | ✅ 95/100 (CMS 관리) |
| **확장성** | ❌ 35/100 (코드 변경 필요) | ✅ 100/100 (블록 재사용) |

**결론:** OfferingBlock이 올바른 구현 패턴의 모범 사례입니다.

---

## 💡 모범 사례 체크리스트 (다른 블록에도 적용 가능)

### ✅ OfferingBlock에서 배울 점
1. ✅ **CMS 글로벌 설정 활용** → 콘텐츠를 코드가 아닌 CMS에서 관리
2. ✅ **Content Block 패턴** → 재사용 가능한 블록 구조
3. ✅ **조건부 렌더링** → 데이터 없으면 빈 블록 숨김
4. ✅ **타입 안전성** → Payload 타입 자동 생성 활용
5. ✅ **서버 컴포넌트** → `async` 함수로 직접 데이터 fetch
6. ✅ **Media 컴포넌트** → Payload의 이미지 최적화 활용
7. ✅ **관리자 친화적 UI** → 한글 라벨 + 설명 + 기본값

### 📝 sermon 페이지에 적용해야 할 패턴
1. ❌ 코드 기반 YouTube RSS 파싱 → ✅ `Videos` 컬렉션 또는 `YouTubeBlock`
2. ❌ 하드코딩된 UI → ✅ CMS 블록 조합
3. ❌ 직접 데이터 fetch → ✅ Payload 컬렉션 활용

---

## 🎯 권장 후속 작업

### 1. 즉시 적용 (P0)
- ✅ 이 구현 패턴을 **프로젝트 표준**으로 채택
- ✅ sermon 페이지를 이 패턴으로 리팩토링
- ✅ 다른 코드 기반 페이지들도 동일하게 전환

### 2. 단기 (1주 이내, P1)
- [ ] 하드코딩된 색상을 Tailwind config로 이동
- [ ] 접근성 개선 (ARIA 속성, alt 텍스트)
- [ ] 계좌번호 복사 버튼 추가 (선택 사항)

### 3. 중기 (1개월 이내, P2)
- [ ] Integration + E2E 테스트 작성
- [ ] 에러 핸들링 강화 (try/catch + 폴백 UI)
- [ ] 다국어 지원 (i18n 필드 추가)

### 4. 장기 (분기 단위, P3)
- [ ] CMS 관리자 가이드 작성 (헌금 정보 업데이트 방법)
- [ ] A/B 테스트 (QR 코드 위치, 메시지 톤 등)
- [ ] 분석 추가 (헌금 안내 블록 조회 수 추적)

---

## 📚 학습 자료

### 이 커밋에서 보여준 우수한 패턴들
1. **Payload Global Config 활용**
   - [Payload Globals 공식 문서](https://payloadcms.com/docs/configuration/globals)
   - 사이트 전역 설정을 CMS로 관리하는 모범 사례

2. **Content Block 설계**
   - [Payload Blocks 공식 문서](https://payloadcms.com/docs/fields/blocks)
   - 재사용 가능한 콘텐츠 블록 시스템

3. **React Server Components**
   - [Next.js 공식 문서](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
   - `async` 컴포넌트로 서버 사이드 데이터 fetch

4. **타입 안전성**
   - [Payload TypeScript](https://payloadcms.com/docs/typescript/overview)
   - 자동 타입 생성으로 타입 안전성 보장

---

## 🏆 결론

### ✅ 매우 우수한 구현
- **CMS 우선 원칙 완벽 준수** (sermon 페이지의 정반대 사례)
- **프로덕션 레디** (약간의 개선만으로 배포 가능)
- **확장 가능** (다국어, A/B 테스트, 분석 추가 용이)
- **유지보수 용이** (코드 수정 없이 CMS에서 관리)

### 💡 이 패턴을 표준으로!
- 향후 모든 새 블록은 이 패턴을 따라야 함
- sermon, announcements 등 기존 코드 기반 페이지를 이 패턴으로 전환 필요
- 개발팀 온보딩 자료로 활용 가능

### 📈 프로젝트 품질 향상
- sermon 페이지 리팩토링 후 전체 코드베이스가 일관된 CMS 우선 패턴을 따르게 됨
- 관리자가 개발자 없이 대부분의 콘텐츠를 직접 관리 가능
- 장기적으로 유지보수 비용 대폭 감소

---

**리뷰어:** church-reviewer  
**날짜:** 2026-04-01 00:35 UTC  
**리뷰 커밋:** 30d5fd5  
**평가:** ⭐⭐⭐⭐⭐ (5/5) - 모범 사례로 채택 권장

---

## 2026-03-31 22:50 UTC

### 리뷰 범위
커밋 1dd7a1d - feat: add newcomer registration system

---

### 📋 기능 개요
새가족 온라인 등록 시스템 구현:
- Newcomers 컬렉션 (Payload CMS)
- /newcomer 등록 페이지 (React form)
- /api/newcomers POST 엔드포인트
- Hero section에 CTA 버튼 추가

---

### ✅ 좋은 점

#### 1. CMS 우선 원칙 준수
- ✅ **Payload 컬렉션 기반**: 모든 데이터를 Newcomers 컬렉션으로 관리
- ✅ **Admin 인터페이스**: 새가족 담당자가 Payload Admin에서 등록 내용 확인 가능
- ✅ **스키마 주도 개발**: 타입 생성 (`payload-types.ts`) 자동화

#### 2. 보안 패턴 준수
- ✅ **Public Create Access**: `create: () => true`로 비인증 사용자도 등록 가능
- ✅ **Protected Read/Update/Delete**: 인증된 사용자만 조회/수정/삭제 가능
- ✅ **overrideAccess: false**: API route에서 접근 제어 우회하지 않음 (정확한 보안 패턴)
- ✅ **필수 동의 검증**: `contactConsent` 체크박스 필수 입력

#### 3. UX/UI
- ✅ **응답형 디자인**: 모바일/데스크톱 모두 대응
- ✅ **명확한 피드백**: 제출 성공 시 성공 메시지 + 폼 초기화
- ✅ **에러 핸들링**: 서버 에러 시 사용자 친화적 메시지 표시
- ✅ **접근성**: `<label>` + `htmlFor`, `required` 속성, semantic HTML 사용

#### 4. 타입 안전성
- ✅ **TypeScript strict**: FormData 타입 정의, Payload 타입 자동 생성
- ✅ **서버/클라이언트 타입 일관성**: Payload types를 통한 타입 동기화

---

### ⚠️ 개선 필요 사항

#### 1. 하드코딩된 경로 (중요도: 중)
**파일:** `src/components/home/HeroSection.tsx`

```tsx
<a href="/newcomer" ...>
```

**문제점:**
- `/newcomer` 경로가 하드코딩되어 있음
- URL 변경 시 여러 곳 수정 필요

**권장:**
```tsx
// src/lib/routes.ts
export const ROUTES = {
  NEWCOMER: '/newcomer',
  ANNOUNCEMENTS: '/announcements',
  // ...
} as const

// HeroSection.tsx
import { ROUTES } from '@/lib/routes'
<a href={ROUTES.NEWCOMER} ...>
```

또는 CMS 글로벌 설정으로 관리:
```typescript
// src/globals/SiteSettings.ts
{
  name: 'newcomerPageUrl',
  type: 'text',
  defaultValue: '/newcomer',
  label: '새가족 등록 페이지 URL',
}
```

---

#### 2. 에러 핸들링 개선 (중요도: 중)
**파일:** `src/app/api/newcomers/route.ts`

**현재:**
```typescript
console.error('Newcomer registration error:', error)
return NextResponse.json(
  { error: '등록 중 오류가 발생했습니다' },
  { status: 500 }
)
```

**문제점:**
- 구체적인 에러 정보를 사용자에게 전달하지 않음
- 디버깅 시 로그만으로는 원인 파악 어려울 수 있음

**권장:**
```typescript
} catch (error) {
  // Payload logger 사용 (console.error 대신)
  const payload = await getPayload({ config: configPromise })
  payload.logger.error('Newcomer registration failed', { error })

  // 에러 유형별 처리
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: '입력 형식이 올바르지 않습니다', details: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: '등록 중 오류가 발생했습니다' },
    { status: 500 }
  )
}
```

---

#### 3. 폼 검증 중복 (중요도: 낮)
**파일:** `src/app/(frontend)/newcomer/NewcomerForm.tsx`

**현재:**
- 클라이언트: `alert('연락 동의에 체크해주세요')`
- 서버: `if (!body.contactConsent) { return ... }`

**문제점:**
- 동일한 검증 로직이 클라이언트/서버에 중복됨
- 유지보수 시 두 곳 모두 수정 필요

**권장:**
- 공통 검증 스키마 사용 (Zod, Yup 등)
```typescript
// src/lib/validations/newcomer.ts
import { z } from 'zod'

export const newcomerSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '올바른 연락처 형식이 아닙니다'),
  contactConsent: z.literal(true, { message: '연락 동의가 필요합니다' }),
  // ...
})

// 클라이언트/서버 모두에서 재사용
const result = newcomerSchema.safeParse(formData)
```

---

#### 4. 접근성 개선 (중요도: 낮)
**파일:** `src/app/(frontend)/newcomer/NewcomerForm.tsx`

**현재:**
```tsx
<div className="inline-flex ... bg-green-100 text-green-600 ...">
  <svg ... />
</div>
```

**권장:**
- 성공 아이콘에 `aria-label` 추가
- 필수 입력 표시에 screen reader용 텍스트 추가

```tsx
<div className="inline-flex ..." aria-label="등록 완료">
  <svg aria-hidden="true" ... />
</div>

{/* 필수 표시 */}
<label>
  이름 
  <span className="text-red-500" aria-label="필수 입력">*</span>
</label>
```

---

#### 5. 하드코딩된 스타일 색상 (중요도: 낮)
**파일:** 여러 파일

**현재:**
```tsx
className="bg-[#1B3A2D] text-white ..."
className="text-[#C9A84C] ..."
```

**문제점:**
- 브랜드 컬러가 여러 파일에 하드코딩됨
- 색상 변경 시 일괄 수정 어려움

**권장:**
- Tailwind config에 커스텀 색상 등록 (이미 있는지 확인 필요)
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'church-primary': '#1B3A2D',
        'church-accent': '#C9A84C',
      }
    }
  }
}

// 사용
className="bg-church-primary text-white"
```

또는 CMS 글로벌 설정으로 관리:
```typescript
// globals/SiteSettings.ts
{
  name: 'brandColor',
  type: 'text',
  defaultValue: '#1B3A2D',
  label: '브랜드 메인 컬러',
}
```

---

#### 6. TODO 구현 필요
**파일:** `src/collections/Newcomers/index.ts`

```typescript
hooks: {
  afterChange: [
    async ({ doc, operation, req }) => {
      if (operation === 'create') {
        // TODO: 이메일 알림 로직 추가 (추후 구현)
        req.payload.logger.info(`새가족 등록: ${doc.name} (${doc.phone})`)
      }
    },
  ],
}
```

**권장:**
- 이메일 알림 기능 구현 (Nodemailer, SendGrid 등)
- 또는 Discord webhook으로 #새가족 채널에 알림 전송
```typescript
if (operation === 'create') {
  // Discord webhook 알림
  await fetch(process.env.DISCORD_NEWCOMER_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🎉 새가족 등록: ${doc.name} (${doc.phone})\n경로: ${doc.visitSource}`,
    }),
  })
}
```

---

#### 7. 타입 안전성 강화 (중요도: 낮)
**파일:** `src/app/api/newcomers/route.ts`

**현재:**
```typescript
const body = await request.json()
// body는 any 타입
```

**권장:**
```typescript
import { newcomerSchema } from '@/lib/validations/newcomer'

const body = await request.json()
const validatedData = newcomerSchema.parse(body) // 타입 안전 + 런타임 검증
```

---

### 📊 성능 고려사항

#### N+1 쿼리 없음
- ✅ 단일 `payload.create()` 호출로 등록 완료
- ✅ 추가 관계 쿼리 없음

#### 클라이언트 번들
- ⚠️ **Form 컴포넌트 크기**: 311줄의 클라이언트 컴포넌트
- 📝 **권장**: 복잡한 폼이므로 현재 크기는 적절. 추후 확장 시 섹션별로 분리 고려

---

### 🧪 테스트 권장 사항

#### 1. Integration Test
```typescript
// src/app/api/newcomers/route.test.ts
describe('POST /api/newcomers', () => {
  it('should create newcomer with valid data', async () => {
    const response = await fetch('/api/newcomers', {
      method: 'POST',
      body: JSON.stringify({
        name: '테스트',
        phone: '010-1234-5678',
        visitSource: 'referral',
        contactConsent: true,
      }),
    })
    expect(response.status).toBe(201)
  })

  it('should reject without contactConsent', async () => {
    const response = await fetch('/api/newcomers', {
      method: 'POST',
      body: JSON.stringify({
        name: '테스트',
        phone: '010-1234-5678',
        contactConsent: false,
      }),
    })
    expect(response.status).toBe(400)
  })
})
```

#### 2. E2E Test
```typescript
// e2e/newcomer.spec.ts
test('should submit newcomer form successfully', async ({ page }) => {
  await page.goto('/newcomer')
  await page.fill('#name', '홍길동')
  await page.fill('#phone', '010-1234-5678')
  await page.selectOption('#visitSource', 'referral')
  await page.check('#contactConsent')
  await page.click('button[type="submit"]')
  
  await expect(page.locator('text=등록이 완료되었습니다')).toBeVisible()
})
```

---

## 종합 평가

### ✅ 매우 잘된 점
1. **CMS 우선 원칙 철저히 준수** - 코드가 아닌 CMS로 데이터 관리
2. **보안 패턴 완벽 준수** - `overrideAccess: false`, 접근 제어 올바름
3. **타입 안전성** - TypeScript strict mode, Payload 타입 자동 생성
4. **UX** - 명확한 피드백, 응답형 디자인, 접근성 고려

### ⚠️ 개선 권장 (우선순위순)
1. **중요:** 하드코딩된 경로 → 상수 또는 CMS 설정으로 관리
2. **중요:** 에러 핸들링 개선 (Payload logger 사용, 에러 유형별 처리)
3. **중요:** TODO 구현 (이메일/Discord 알림)
4. **권장:** 폼 검증 스키마 통합 (Zod 등)
5. **권장:** 브랜드 색상 Tailwind config로 관리
6. **권장:** 접근성 개선 (aria-label)
7. **권장:** 테스트 작성 (integration + e2e)

### 📈 코드 품질 점수
- **보안:** 95/100 (overrideAccess 패턴 완벽)
- **타입 안전성:** 90/100 (API route body 타입 강화 가능)
- **CMS 원칙 준수:** 100/100 (완벽)
- **접근성:** 85/100 (aria-label 추가 권장)
- **성능:** 90/100 (N+1 쿼리 없음, 클라이언트 번들 적정)
- **유지보수성:** 80/100 (하드코딩 제거 시 90점)

**종합:** 88/100 (매우 우수)

---

**리뷰어:** church-reviewer  
**날짜:** 2026-03-31 22:50 UTC  
**리뷰 커밋:** 1dd7a1d

---

## 2026-03-31 12:47 UTC

### 리뷰 범위
최근 10개 커밋 (e4b7ee4 ~ a283fd3)

---

### 1. e4b7ee4 - fix: make announcement cards clickable (link to /announcements)

**파일:** `src/components/home/AnnouncementsSection.tsx`

**리뷰:**
- ✅ **접근성 개선**: `<article>` 태그를 `<Link>`로 감싸서 카드 전체를 클릭 가능하게 만듦
- ✅ **의미론적 마크업**: `<Link>` 안에 `<article>`을 중첩하여 시맨틱 구조 유지
- ⚠️ **개선 사항**:
  - **CMS 설정 가능성**: `/announcements` 경로가 하드코딩되어 있음. 글로벌 설정이나 환경변수로 관리하는 것이 좋음
  - **접근성**: `<Link>`에 `aria-label` 추가 권장 (예: `aria-label={item.title}`)
  - **스타일 중복**: `block` 클래스가 추가되었는데, 이미 `group`과 함께 사용되는 스타일과 중복될 수 있음

**권장 개선:**
```typescript
<Link
  key={item.id}
  href="/announcements"
  aria-label={`${item.title} - 자세히 보기`}
  className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 block"
>
```

---

### 2. 18a2f96 - fix: remove subItems from Header schema + rollback to flat nav

**관찰:**
- DB 마이그레이션 이슈로 인해 중첩 네비게이션 구조를 평면 구조로 롤백
- ⚠️ **마이그레이션 패턴**: 스키마 변경 시 마이그레이션 스크립트를 먼저 테스트하고 적용하는 것이 좋음
- 📝 **문서화**: 이런 롤백 결정은 별도 이슈나 ADR(Architecture Decision Record)로 기록 권장

---

### 3. 5f1b1d6 - fix: add try/catch to all generateStaticParams + force-dynamic on posts pages

**리뷰:**
- ✅ **에러 핸들링**: `try/catch`로 빌드 시 DB 에러 방어
- ✅ **동적 렌더링**: `force-dynamic`으로 빌드 타임 에러 회피
- ⚠️ **근본 원인 해결**: 임시 방편성 수정. 마이그레이션 타이밍 문제를 근본적으로 해결해야 함
- 📊 **성능**: `force-dynamic`은 SSG 이점을 포기하는 것이므로, 마이그레이션 완료 후 다시 static으로 전환 검토 필요

---

### 4. 4f018a9 - fix: revert buildCommand to default

**관찰:**
- 빌드 커맨드 롤백
- ⚠️ **빌드 프로세스**: Vercel 환경에서 마이그레이션 + 빌드를 한 번에 실행하려는 시도가 실패
- 💡 **권장**: Vercel의 `postinstall` 스크립트나 별도 마이그레이션 단계 고려

---

### 5. 7a25d05 - fix: remove new blocks from RenderBlocks, add code-based announcements page

**리뷰:**
- ✅ **점진적 롤백**: 마이그레이션 완료 전까지 새 블록 제거
- ⚠️ **코드 기반 페이지**: announcements 페이지를 코드로 구현
  - **CMS 원칙 위배**: 가능한 한 CMS로 관리해야 함
  - 마이그레이션 완료 후 CMS 블록으로 다시 전환해야 함

---

### 6. dd6e786 - fix: set buildCommand to pnpm run ci (migrate + build)

**관찰:**
- 빌드 커맨드에 마이그레이션 추가 시도
- ⚠️ **타임아웃 위험**: 이후 롤백된 것으로 보아 실패
- 💡 **권장**: 마이그레이션은 배포 전 단계에서 별도로 실행하거나, Vercel의 build 단계가 아닌 다른 라이프사이클 활용

---

### 7. 009bb35 - fix: remove new blocks from Pages until migration runs + force-dynamic bulletins

**리뷰:**
- ✅ **동일 패턴**: generateStaticParams 에러 회피
- ⚠️ **일관성**: 여러 커밋에 걸쳐 동일한 문제를 반복 수정하고 있음
- 💡 **권장**: 마이그레이션 전략을 먼저 확정하고, 한 번에 적용

---

### 8. 6813dfa - fix: force dynamic rendering for slug pages

**리뷰:**
- ✅ **빌드 안정화**: 동적 렌더링으로 전환
- ⚠️ **성능 트레이드오프**: SSG → SSR 전환으로 성능 저하 가능성
- 📊 **모니터링**: 배포 후 응답 시간 모니터링 필요

---

### 9. d25dd1e - fix: wrap generateStaticParams in try/catch

**리뷰:**
- ✅ **에러 핸들링 강화**
- ⚠️ **중복 패턴**: 여러 커밋에서 반복
- 💡 **리팩토링 기회**: 공통 유틸 함수로 추출 가능

---

### 10. a283fd3 - fix: add migration for pages blocks tables

**리뷰:**
- ✅ **마이그레이션 추가**: bulletins, announcements, header subitems 테이블
- ⚠️ **타이밍**: 이 마이그레이션이 먼저 실행되었어야 이후 롤백들이 필요 없었을 것
- 📝 **문서화**: 마이그레이션 순서와 의존성을 문서화 필요

---

## 종합 평가

### ✅ 좋은 점
1. **점진적 문제 해결**: 빌드 실패를 단계적으로 해결하려는 접근
2. **에러 핸들링**: try/catch 추가로 빌드 안정성 확보
3. **빠른 대응**: 프로덕션 배포 문제를 신속하게 핫픽스

### ⚠️ 개선 필요
1. **마이그레이션 전략 부재**: 스키마 변경 시 마이그레이션 우선 순위 정립 필요
2. **CMS 원칙 위배**: 코드 기반 구현이 일부 있음 (announcements 페이지)
3. **반복적 수정**: 동일한 문제를 여러 커밋에 걸쳐 수정
4. **하드코딩**: URL, 경로 등이 하드코딩되어 있음
5. **성능 트레이드오프**: force-dynamic 사용으로 SSG 이점 포기

### 💡 권장 사항
1. **마이그레이션 워크플로우 정립**
   - 로컬 → 스테이징 → 프로덕션 순서로 마이그레이션 실행
   - Vercel 빌드 전에 마이그레이션 완료 보장
2. **공통 유틸 함수 작성**
   - `safeGenerateStaticParams` 같은 헬퍼 함수로 반복 제거
3. **CMS 우선 원칙 재확립**
   - 코드 기반 announcements 페이지를 CMS 블록으로 전환
   - 하드코딩된 URL을 글로벌 설정으로 이동
4. **접근성 강화**
   - 클릭 가능한 카드에 aria-label 추가
   - alt 텍스트, ARIA 속성 체크리스트 작성
5. **모니터링 추가**
   - force-dynamic 페이지의 응답 시간 추적
   - 마이그레이션 실패 시 알림 설정

---

**리뷰어:** church-reviewer  
**날짜:** 2026-03-31 12:47 UTC  
**리뷰 커밋 범위:** e4b7ee4 ~ a283fd3
