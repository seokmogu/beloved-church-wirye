# CODER_LOG.md

## 2026-04-01 00:19 UTC

### 작업: 헌금 안내 블록 추가 ✅

**우선순위**: PLANNING.md 2순위 항목  
**브랜치**: `feature/offering-info`  
**커밋**: `37a5ffb` → PR #7 → squash merge `30d5fd5`  
**배포 URL**: https://beloved-church-wirye.vercel.app

**구현 내용**:
1. SiteSettings 글로벌에 헌금 관련 필드 추가:
   - `offeringBankName` (은행명)
   - `offeringAccountNumber` (계좌번호)
   - `offeringAccountHolder` (예금주)
   - `offeringKakaoPayQr` (카카오페이 QR 코드 이미지)
   - `offeringNotes` (안내 메시지)

2. OfferingBlock 컴포넌트 신규 생성:
   - 서버 컴포넌트로 SiteSettings 자동 fetch
   - 계좌 정보와 카카오페이 QR 선택적 표시
   - 빈 데이터일 경우 렌더링 안 함
   - 반응형 그리드 (모바일/태블릿/데스크톱)

3. Pages 컬렉션에 OfferingBlock 등록
4. RenderBlocks에 OfferingBlock 추가

**기술 세부사항**:
- TypeScript strict 모드 통과
- Payload types 자동 생성 완료
- Vercel 빌드 성공 (빌드 시간: 1m)

**다음 단계**:
- ✅ CMS 어드민에서 헌금 정보 입력 필요 (웹 관리자)
- ✅ `/worship` 페이지에 OfferingBlock 추가 (CMS 작업)

**상태**: 완료 (CMS 데이터 입력만 남음)

---

## 2026-04-01 00:46 UTC

### 작업: 404 라우팅 문제 해결 ✅

**우선순위**: DESIGN_REPORT.md 최우선 항목  
**브랜치**: `fix/404-routing-redirects`  
**커밋**: `6235c15` → PR #8 → squash merge `462efd2`  
**배포 URL**: https://beloved-church-wirye.vercel.app

**문제점**:
- `/ministry`, `/sermons`, `/news` 라우트에서 404 발생
- 레거시 URL 또는 외부 링크로 인한 접근성 문제

**구현 내용**:
1. `redirects.ts`에 영구 리다이렉트 규칙 추가:
   - `/ministry` → `/about` (교회 소개/사역)
   - `/sermons` → `/sermon` (설교 페이지)
   - `/news` → `/announcements` (공지사항)

**기술 세부사항**:
- Next.js redirects API 사용 (permanent: true)
- TypeScript strict 모드 통과
- Vercel 빌드 성공 (빌드 시간: 1m)

**효과**:
- SEO 개선 (404 → 301 리다이렉트)
- 사용자 경험 향상 (에러 페이지 대신 적절한 페이지로 안내)
- 외부 링크 유효성 유지

**상태**: 완료 ✅

---

## 2026-04-01 01:16 UTC

### 작업: 빈 상태 페이지 디자인 개선 ✅

**우선순위**: DESIGN_REPORT.md 2순위 항목  
**브랜치**: `feature/empty-state-component`  
**커밋**: `0ff7a60` → PR #9 → squash merge `1ef2273`  
**배포 URL**: https://beloved-church-wirye.vercel.app

**문제점**:
- 주보/공지사항 페이지의 빈 상태가 텍스트만 표시
- 에러 상태와 빈 상태 구분 불명확
- UX 개선 필요

**구현 내용**:
1. 재사용 가능한 `EmptyState` 컴포넌트 신규 생성:
   - 4가지 아이콘 타입 지원 (document, announcement, search, error)
   - title, description, CTA 버튼 구성
   - 내부/외부 링크 모두 지원
   - 브랜드 컬러 일관성 유지

2. 주보 페이지 (`/bulletins`) 적용:
   - 에러 상태: "주보를 불러올 수 없습니다" + 홈 CTA
   - 빈 상태: "등록된 주보가 없습니다" + 예배 안내 CTA

3. 공지사항 페이지 (`/announcements`) 적용:
   - 에러 상태: "공지사항을 불러올 수 없습니다" + 홈 CTA
   - 빈 상태: "등록된 공지사항이 없습니다" + 예배 안내 CTA

**기술 세부사항**:
- TypeScript strict 모드 통과
- 서버/클라이언트 컴포넌트 호환
- Vercel 빌드 성공 (빌드 시간: 2m)

**효과**:
- UX 향상: 사용자에게 명확한 안내와 다음 행동 제시
- 재사용성: 다른 페이지/검색 결과에서도 활용 가능
- 일관성: 디자인 시스템 강화

**상태**: 완료 ✅

---

---

## 2026-04-01 01:49 UTC

### 작업: 새가족 온라인 등록 시스템 구현 ✅

**우선순위**: PLANNING.md 3순위 항목 (🟡 높음)  
**브랜치**: `feature/newcomer-form`  
**커밋**: `7493eee` → PR #10 → squash merge `6ee46e6`  
**배포 URL**: https://beloved-church-wirye.vercel.app/newcomer

**문제점**:
- 새가족이 온라인으로 등록할 방법이 없음
- 첫 방문자의 허들이 높고 교회와의 연결고리 부족
- 새가족 데이터 수집 및 관리 시스템 부재

**구현 내용**:

1. **Payload CMS Newcomers 컬렉션**:
   - 이름, 연락처, 이메일 (선택)
   - 방문 예정일/첫 방문일
   - 교회를 알게 된 경로 (6가지 옵션 + 상세)
   - 관심 사역/모임 (다중 선택: 청년부, 찬양팀, 성경공부, 봉사, 기도회, 소그룹)
   - 문의사항/기도제목
   - 개인정보 수집 동의 (필수)
   - 상태 관리 (대기/연락완료/방문완료/등록완료)
   - 관리자 메모 (내부 전용)

2. **페이지 구현**:
   - `/newcomer` - 새가족 등록 폼 (반응형 디자인)
   - `/newcomer/thank-you` - 등록 완료 감사 페이지 (예배 안내 포함)

3. **API 엔드포인트**:
   - `POST /api/newcomers` - 새가족 정보 저장
   - 필수 필드 검증
   - Payload CMS 보안 규칙 준수 (`overrideAccess: false`)

4. **데이터베이스 마이그레이션**:
   - `20260401_014900_add_newcomers.ts` 생성
   - newcomers 테이블 추가
   - 인덱스 설정 (created_at, status, visit_date)

5. **UX 개선**:
   - 메인 히어로 섹션에 "새가족 등록" CTA 버튼 추가 (브랜드 컬러)
   - "예배 안내" 버튼을 세컨더리 스타일로 변경
   - 폼 입력 UX 최적화 (플레이스홀더, 도움말, 접근성)

**보안**:
- Access Control:
  - Create: 누구나 가능 (공개 폼)
  - Read/Update/Delete: 인증된 관리자만
- 개인정보 동의 필수 체크
- `overrideAccess: false`로 Payload 보안 규칙 준수
- 관리자 메모는 새가족에게 노출되지 않음

**기술 세부사항**:
- TypeScript strict 모드 통과
- 타입 생성 완료 (`payload generate:types`)
- Vercel 빌드 성공 (빌드 시간: 2m)
- 배포 완료

**효과**:
- 새가족 온라인 등록 경로 확보 (전환율 개선 기대)
- 담당자 연락 전 사전 정보 수집으로 개인화된 환영 가능
- 통계 데이터 축적으로 마케팅 채널 효과 분석 가능
- 메인 페이지 CTA 개선으로 새가족 유입 증가 기대

**향후 개선 사항**:
- 담당자 이메일 알림 기능 (Resend API)
- 새가족 통계 대시보드 (CMS 또는 별도 페이지)
- 자동 문자 발송 (예배 전 리마인더)

**상태**: 완료 ✅

---

## 2026-04-01 02:49 UTC

### 작업: 브랜드 컬러 중앙화 (Tailwind 설정) ✅

**우선순위**: REVIEW_REPORT.md P1 이슈  
**브랜치**: `feature/brand-color-centralization`  
**커밋**: `bc2f200` → PR #12 → squash merge `5e00bd9`  
**배포 URL**: https://beloved-church-wirye.vercel.app

**문제점**:
- 하드코딩된 hex 색상 코드가 19개 컴포넌트에 산재 (#1B3A2D, #C9A84C, #F5F0E8)
- 유지보수 어려움 (색상 변경 시 전체 수정 필요)
- 일관성 관리 위험

**구현 내용**:
1. `tailwind.config.mjs`에 브랜드 컬러 정의:
   - `primary` (다크 그린): #1B3A2D / -dark / -light
   - `secondary` (골드): #C9A84C / -dark / -light
   - `neutral-cream` (베이지): #F5F0E8

2. 19개 컴포넌트 파일에서 하드코딩된 색상 교체:
   - `text-[#C9A84C]` → `text-secondary`
   - `bg-[#1B3A2D]` → `bg-primary`
   - `bg-[#F5F0E8]` → `bg-neutral-cream`
   - opacity, hover, border 등 모든 변형 포함

**수정 파일**:
- 컴포넌트: Header, Footer, EmptyState, Hero, Church Intro, Announcements, Instagram, YouTube, Naver Map
- 페이지: newcomer, sermon, bulletins, announcements
- 블록: AnnouncementsBlock, BulletinsBlock
- 히어로: PageBanner

**기술 세부사항**:
- TypeScript strict 모드 통과 (`pnpm tsc --noEmit`)
- Vercel 빌드 성공 (빌드 시간: 2m)
- 0개 하드코딩 색상 남음 (완전 제거)

**효과**:
- 유지보수성 향상: 한 곳에서 모든 브랜드 컬러 관리
- 일관성 강화: 잘못된 색상 사용 원천 차단
- 확장성: 다크모드, 테마 전환 등 향후 기능 준비
- P1 리뷰 이슈 해결: 코드 품질 향상

**상태**: 완료 ✅

---

## 2026-04-01 03:19 UTC

### 작업: 히어로 섹션 타이포그래피 및 배경 개선 ✅

**우선순위**: DESIGN_REPORT.md 중간 우선순위 항목  
**브랜치**: `feature/hero-typography-enhancement`  
**커밋**: `86fcf09` → PR #13 → squash merge `0cdddbe`  
**배포 URL**: https://beloved-church-wirye.vercel.app

**문제점**:
- 히어로 섹션 (주보, 공지사항) 영문 타이틀 폰트 크기 너무 작음 (text-sm)
- 서브타이틀 폰트 웨이트 부족 (투명도만 조정)
- 단색 배경으로 깊이감 부족
- 시각적 임팩트 약함

**구현 내용**:

1. **타이포그래피 개선**:
   - 영문 타이틀: `text-sm` → `text-base md:text-lg` (크기 확대)
   - 영문 타이틀: `font-medium` → `font-semibold` (웨이트 강화)
   - Letter-spacing: `tracking-wider` → `tracking-[0.2em]` (가독성 향상)
   - 서브타이틀: `text-white/60` → `text-white/80 font-medium` (명확성 향상)
   - 영문/한글 타이틀 간격: `mb-2` → `mb-3` (시각적 계층 강화)

2. **배경 디자인 개선**:
   - 단색 배경 → 그라디언트 배경 (`from-primary via-primary to-primary-dark`)
   - 미세한 배경 패턴 추가 (두 개의 blur 원형 그라디언트)
   - 깊이감 향상을 위한 opacity 조정 (0.05)
   - z-index 계층 구조로 콘텐츠와 배경 분리

**수정 파일**:
- `/src/app/(frontend)/bulletins/page.tsx`
- `/src/app/(frontend)/announcements/page.tsx`

**기술 세부사항**:
- TypeScript strict 모드 통과 (`pnpm tsc --noEmit`)
- Vercel 빌드 성공 (빌드 시간: 2m)
- Tailwind `primary-dark` 색상 활용 (이미 정의됨)

**효과**:
- 시각적 임팩트 향상: 그라디언트와 패턴으로 전문성 증가
- 가독성 개선: 영문 타이틀 크기 확대로 시각적 계층 명확화
- 브랜드 일관성: 브랜드 컬러 팔레트 활용
- UX 향상: 서브타이틀 명확도 개선으로 페이지 목적 명확화

**DESIGN_REPORT.md 반영**:
- ✅ 영문 타이틀 폰트 크기 확대
- ✅ 서브타이틀 폰트 웨이트 조정
- ✅ 배경 그라디언트 및 패턴 추가
- ✅ 깊이감 부여 완료

**상태**: 완료 ✅

---

## 2026-04-01 03:52 UTC

### 작업: PageHero 컴포넌트 추출 (리팩토링) ✅

**우선순위**: REVIEW_REPORT.md P2 항목 (코드 중복 제거)  
**브랜치**: `feature/page-hero-component`  
**커밋**: `bb6c4ef` → PR #14 → squash merge `54c08fe`  
**배포 URL**: https://beloved-church-wirye.vercel.app

**문제점**:
- `bulletins/page.tsx`와 `announcements/page.tsx`에 히어로 섹션 코드 중복
- 동일한 구조를 두 곳에서 유지해야 하는 유지보수 부담
- 향후 다른 페이지에 히어로 추가 시 또 다른 중복 발생 가능성

**구현 내용**:

1. **PageHero 컴포넌트 생성** (`src/components/PageHero.tsx`):
   - Props: `label`, `title`, `subtitle`, `className`, `children`
   - 그라디언트 배경 + 장식 패턴 (blur circle)
   - TypeScript 인터페이스 완비
   - JSDoc 문서화

2. **bulletins/page.tsx 리팩토링**:
   - 15줄의 히어로 코드 → 1줄 컴포넌트 호출
   - `<PageHero label="WEEKLY BULLETIN" title="주보" subtitle="..." />`

3. **announcements/page.tsx 리팩토링**:
   - 15줄의 히어로 코드 → 1줄 컴포넌트 호출
   - `<PageHero label="NOTICE" title="공지사항" subtitle="..." />`

**제거된 중복 코드**:
- 그라디언트 배경 정의 (2회 → 1회)
- blur 패턴 구조 (2회 → 1회)
- 타이포그래피 스타일 (2회 → 1회)
- 총 ~30줄 감소

**기술 세부사항**:
- TypeScript strict 모드 통과 (`pnpm tsc --noEmit`)
- 시각적 변화 없음 (순수 리팩토링)
- Vercel 빌드 성공 (빌드 시간: 2m)

**효과**:
- 유지보수성 향상: 히어로 디자인 변경 시 한 곳만 수정
- 재사용성: 향후 `/about`, `/worship` 등 다른 페이지에도 활용 가능
- 일관성 강화: 모든 페이지 히어로가 동일한 구조 보장
- 코드 가독성: 페이지 파일에서 컨텐츠 로직에 집중 가능

**REVIEW_REPORT.md 반영**:
- ✅ PageHero 컴포넌트화 완료 (P2 이슈 해결)
- ✅ DRY 원칙 준수
- ✅ 확장성 확보

**상태**: 완료 ✅

---
