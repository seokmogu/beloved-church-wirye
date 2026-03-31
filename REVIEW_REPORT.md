# Code Review Report

## 2026-03-31 11:45 UTC

### 리뷰 범위
- e4b7ee4: fix: make announcement cards clickable
- 18a2f96: fix: remove subItems from Header schema + rollback to flat nav
- 7a25d05: fix: remove new blocks from RenderBlocks, add code-based announcements page

---

## 주요 발견사항

### 1. ✅ 긍정적인 부분

#### e4b7ee4 (AnnouncementsSection.tsx)
- 접근성 개선: `<Link>` 사용으로 클릭 가능한 카드 구현
- 시맨틱 HTML: `<article>`, `<time>` 태그 적절히 사용
- 타입 안전성: interface로 props 정의

#### 18a2f96 (Header rollback)
- 복잡도 감소: subItems 제거로 단순화
- 마이그레이션 롤백으로 DB 문제 회피

---

### 2. ⚠️ 개선 필요사항

#### **공지사항 페이지 하드코딩 (7a25d05)**
```typescript
// src/app/(frontend)/announcements/page.tsx
// ❌ 문제: 전체 페이지가 코드로 하드코딩됨
```

**핵심 문제:**
- 페이지 레이아웃/텍스트가 모두 코드에 박혀있음
- CMS로 해야 할 것을 코드로 구현
- 헤더 텍스트("공지사항", "사랑하는교회의 새 소식을..."), 색상, 스타일 모두 코드에 고정

**권장 해결책:**
1. **Pages 컬렉션 활용:**
   - `/announcements` 슬러그로 Page 문서 생성
   - 헤더 영역을 `Hero` 블록으로 구성
   - 공지사항 리스트를 `AnnouncementsBlock` 같은 커스텀 블록으로 구현
   
2. **구현 예시:**
   ```typescript
   // src/blocks/AnnouncementsList/config.ts
   export const AnnouncementsListBlock: Block = {
     slug: 'announcementsList',
     fields: [
       { name: 'limit', type: 'number', defaultValue: 30 },
       { name: 'showPinned', type: 'checkbox', defaultValue: true },
     ],
   }
   
   // Component에서 payload.find() 호출
   ```

3. **이점:**
   - 관리자가 CMS에서 헤더 문구, 색상 변경 가능
   - 코드 재배포 없이 UI 수정
   - 다른 페이지와 일관된 아키텍처

---

#### **Nav 타입 안전성 (18a2f96)**
```typescript
// src/Header/Nav/index.tsx
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const navItems: any[] = data?.navItems || []
const link = item.link as { url?: string; label?: string }
```

**문제:**
- `any[]` 사용으로 타입 체크 무력화
- `as` 캐스팅으로 런타임 에러 위험

**권장:**
```typescript
import type { Header, NavItem } from '@/payload-types'

export const HeaderNav: React.FC<{ data: Header }> = ({ data }) => {
  const navItems = (data?.navItems || []) as NavItem[]
  
  return navItems.map((item) => {
    if (!item.link || typeof item.link !== 'object') return null
    const { url, label } = item.link
    // ...
  })
}
```

---

#### **에러 핸들링 개선 필요 (announcements/page.tsx)**
```typescript
} catch (error) {
  console.error('Failed to fetch announcements:', error)
  hasError = true
}
```

**문제:**
- 에러 로깅만 하고 사용자에게 재시도 옵션 없음
- 프로덕션에서 `console.error`는 무의미

**권장:**
```typescript
import { logger } from '@/lib/logger'

try {
  // ...
} catch (error) {
  logger.error('Announcements fetch failed', { error })
  // Sentry 등으로 에러 리포트
}

// UI에서:
{hasError && (
  <div className="text-center py-20">
    <p className="text-muted-foreground mb-4">공지사항을 불러오는 중 오류가 발생했습니다.</p>
    <button onClick={() => window.location.reload()}>다시 시도</button>
  </div>
)}
```

---

#### **주보 링크 하드코딩 (Nav/index.tsx)**
```typescript
<Link href="/bulletins" className="...">
  주보
</Link>
```

**문제:**
- CMS navItems와 별도로 코드에 하드코딩
- 순서 변경/숨김 불가능

**권장:**
- navItems에 "주보" 링크 추가하거나
- 동적으로 추가되는 "special links" 필드를 Header globals에 만들기

---

### 3. 📊 성능/보안

#### ✅ 좋은 점:
- `revalidate = 300`: ISR로 캐싱
- `dynamic = 'force-dynamic'`: 빌드 타임 에러 회피
- 정렬 로직 서버사이드: `sort: '-isPinned,-publishedAt'`

#### ⚠️ 주의:
- `limit: 30` 하드코딩 → CMS 블록 필드로 옮기면 관리자가 조정 가능

---

## 종합 점수

| 항목 | 점수 |
|------|------|
| 타입 안전성 | 6/10 (any 사용, 타입 캐스팅) |
| CMS 활용도 | 4/10 (페이지 하드코딩) |
| 접근성 | 8/10 (시맨틱 태그 사용) |
| 성능 | 7/10 (캐싱 있으나 개선 여지) |
| 보안 | 7/10 (Payload 패턴 준수) |

---

## Action Items

1. **우선순위 높음:**
   - [ ] `announcements/page.tsx`를 Pages + Blocks 구조로 리팩토링
   - [ ] Header Nav에서 `any` 제거, 타입 안전성 확보

2. **우선순위 중간:**
   - [ ] 에러 핸들링 개선 (logger, 사용자 피드백)
   - [ ] 주보 링크를 CMS로 이동

3. **참고:**
   - migration 롤백은 임시 조치 → 향후 안전하게 재적용 고려

---

**리뷰어:** church-reviewer agent  
**다음 리뷰:** 다음 코드 푸시 시
