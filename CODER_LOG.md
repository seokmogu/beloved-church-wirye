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
