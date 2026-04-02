# HEARTBEAT.md — church-dev (오케스트레이터)

## 현재 지시

church-coder 에이전트를 실행하여 아래 작업을 순서대로 처리한다.
완료되면 tester → reviewer → designer 순서로 트리거한다.

### 우선순위 작업 목록

1. **`/location` 500 에러 수정** — 코드 기반 페이지 생성 (worship 패턴)
2. **`/admin` 빈 화면 조사** — Payload CMS + Next.js 16 호환성 확인, 가능하면 수정
3. **PLANNING.md 최신 제안 중 CMS로 가능한 것 구현** — 우선 헌금 계좌 CMS 연동

### 작업 원칙
- CMS로 가능한 건 CMS로
- 브랜치 → 커밋 → 푸시 → vercel --prod 배포
- 배포 후 tester/reviewer/designer 트리거
- 할 게 없으면 HEARTBEAT_OK

### 레포 정보
- 로컬: /home/hackit/.openclaw/workspaces/church-dev/beloved-church-wirye
- 라이브: https://beloved-church-wirye.vercel.app
- Neon DB: 환경변수 POSTGRES_URL (Vercel에 설정됨)
- Vercel CLI 로그인 완료
