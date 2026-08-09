# 웹사이트 Analytics 이벤트

Google Analytics 4 속성에서 집계하는 이벤트의 기준이다. 개인정보, 양식 입력값, 연락처, 동의 여부는 전송하지 않는다.

| 지표 | GA4 기준 | 관리자 대시보드 기준 |
| --- | --- | --- |
| PV | `screenPageViews` | 선택 기간의 전체 페이지 조회수 |
| AU | `activeUsers` | GA4가 브라우저·기기 기반으로 중복 제거한 활성 사용자 수 |
| CTR | `ui_click` / `page_view` | 화면·목적지·요소별 클릭률 |
| CVR | `generate_lead` / `/newcomer`의 `page_view` | 새가족 등록 완료 전환율 |

## 이벤트

- `page_view`: 초기 페이지 및 앱 내 경로 변경 시 수집한다.
- `ui_click`: 공개 화면의 링크, 버튼, 버튼 역할 요소, 제출 버튼 클릭 시 수집한다. `page_path`, `element_type`, `click_id`, `destination`만 보낸다.
- `form_start`: 새가족 등록 양식의 첫 상호작용 시 수집한다.
- `generate_lead`: 새가족 등록 API가 성공했을 때 수집한다. GA4 관리 화면에서 이 이벤트를 주요 이벤트로 지정한다.

## 관리자 대시보드 데이터 연결

관리자 화면은 GA4 Data API에서 집계값을 읽는다. 이 프로젝트의 조직 정책은 서비스 계정의 장기 키 발급을 차단하므로, 관리자 Google 계정의 OAuth 읽기 전용 토큰을 Vercel Production 환경에 보관한다.

- `GOOGLE_ANALYTICS_PROPERTY_ID`
- `GOOGLE_ANALYTICS_OAUTH_CLIENT_ID`
- `GOOGLE_ANALYTICS_OAUTH_CLIENT_SECRET`
- `GOOGLE_ANALYTICS_OAUTH_REFRESH_TOKEN`

OAuth 동의 범위는 `https://www.googleapis.com/auth/analytics.readonly`만 사용한다. OAuth 비밀값과 원문 보고 데이터는 Git에 저장하지 않는다.

OAuth 갱신 토큰을 새로 발급해야 할 때는 `scripts/authorize-google-analytics.mjs`를 사용한다. 클라이언트 JSON과 생성된 토큰 파일은 일회성으로만 다루고, Vercel 환경 변수에 저장된 뒤 즉시 로컬에서 제거한다.
