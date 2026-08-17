# 웹사이트 분석 이벤트와 새가족 퍼널

Google Analytics 4(GA4)에서 방문 경로와 새가족 등록 흐름을 확인하기 위한 기준이다. 분석 코드는 공개 화면에만 적용되며, 관리자(`/manage`)와 Payload 관리 화면에는 적용하지 않는다.

## 개인정보 보호 기준

- 새가족 양식의 이름, 연락처, 주소, 생년월일, 선택 항목, 동의 여부와 오류 원문을 GA4로 보내지 않는다.
- 페이지 URL의 쿼리 문자열도 보내지 않는다. 따라서 링크에 개인 식별 정보를 넣으면 안 된다.
- 외부 유입은 도메인 이름과 승인된 채널명만 기록한다. 임의의 UTM 값은 커스텀 이벤트에 복사하지 않는다.
- GA4가 기본으로 수집하는 source / medium / campaign은 교회가 발행한 표준 UTM 링크만 사용한다.

## 이벤트

| 이벤트 | 발생 시점 | 퍼널에서의 역할 | 전송 항목 |
| --- | --- | --- | --- |
| `page_view` | 첫 진입과 화면 내 경로 변경 | 모든 페이지 도달 | 경로, 제목, 첫 진입 여부 |
| `landing_page_view` | 세션의 첫 페이지 | 외부·직접 유입의 랜딩 | 랜딩 경로, 유입 채널, 외부 참조 도메인 |
| `ui_click` | 공개 화면의 링크·버튼·제출 버튼 클릭 | 일반 탐색 | 화면, 안전한 클릭 ID, 목적지 유형 |
| `outbound_click` | 외부 사이트로 나가는 링크 클릭 | 유튜브·인스타그램·네이버지도 등 이탈 행동 | 화면, 클릭 ID, 목적지 도메인 |
| `select_content` | 설교·교회로그·교회소식·주보·교회 영상 상세로 들어갈 때 | 어떤 공개 콘텐츠가 선택되는지 | 콘텐츠 종류, 안전한 콘텐츠 ID, 출발 화면 |
| `scroll_depth` | 화면 높이의 25·50·75·90%에 처음 도달할 때 | 콘텐츠 읽기 깊이 | 화면, 도달 비율 |
| `resource_open` | 첨부 파일을 내려받거나 파일 링크를 열 때 | 주보·첨부 자료 이용 | 화면, 파일 확장자, 안전한 링크 ID |
| `embedded_content_view` | 지도·인스타그램·유튜브·문서 임베드가 화면의 절반 이상 보일 때 | 임베드 콘텐츠 노출 | 임베드 종류, 콘텐츠 종류, 안전한 콘텐츠 ID |
| `embedded_interaction` | 네이버 지도 같은 페이지 안 임베드와 상호작용할 때 | 지도 이용 관심 | 화면, 임베드 종류, 콘텐츠 종류 |
| `church_video_start` | 임베드 유튜브 영상 재생을 시작할 때 | 영상 시청 시작 | 화면, 콘텐츠 ID, 제공자 |
| `church_video_progress` | 임베드 유튜브 영상의 25·50·75% 시청 시점 | 영상 시청 깊이 | 화면, 콘텐츠 ID, 시청 비율 |
| `church_video_complete` | 임베드 유튜브 영상이 끝날 때 | 영상 시청 완료 | 화면, 콘텐츠 ID, 제공자 |
| `accordion_open` / `accordion_close` | 전사문처럼 접히는 콘텐츠를 열고 닫을 때 | 긴 읽기 콘텐츠의 이용 | 화면, 안전한 아코디언 ID |
| `newcomer_cta_click` | 새가족등록 페이지로 가는 링크 클릭 | 등록 관심 | 화면, 클릭 ID |
| `newcomer_registration_view` | `/newcomer` 도달 | 등록 페이지 진입 | 경로 |
| `form_start` | 새가족 양식 첫 입력 | 양식 시작 | 고정된 양식 ID |
| `form_submit_attempt` | 새가족 양식의 등록 버튼을 누를 때 | 제출 시도 | 고정된 양식 ID |
| `form_error` | 필수 항목 검증 실패 또는 제출 실패 | 이탈 진단 | 고정된 양식 ID, 오류 범주 |
| `generate_lead` | 새가족 등록 API 성공 | 전환 완료 | 고정된 양식 ID |
| `newcomer_completed_view` | 완료 화면 도달 | 완료 화면 확인 | 경로 |

초기 `page_view`도 코드가 직접 보낸다. GA 태그의 자동 초기 페이지뷰는 비활성화하여 중복 집계를 막는다. 스크롤·파일·영상은 GA4의 자동 수집 이벤트와 이름을 겹치지 않게 교회 전용 이름으로 기록하므로, 자동 수집을 유지해도 이 기준의 지표가 중복 합산되지 않는다.

## 새가족 퍼널

관리자 홈은 최근 28일 기준으로 아래 흐름을 표시한다.

1. `landing_page_view` — 외부 채널 또는 직접 방문의 첫 랜딩
2. `newcomer_cta_click` — 새가족등록 안내 클릭
3. `/newcomer`의 페이지 조회 — 등록 페이지 진입
4. `form_start` — 양식 첫 입력
5. `generate_lead` — 등록 성공

이벤트가 배포된 이후의 데이터부터 퍼널 첫 두 단계가 쌓인다. 그 전 기간의 새가족 페이지 조회와 등록 완료 수는 기존 `page_view`, `generate_lead` 집계를 계속 사용한다.

## 콘텐츠 이용 분석

- **콘텐츠 유입**: `select_content`에서 `content_type`을 설교·교회로그·교회소식·주보·교회 영상으로 나눈다.
- **읽기와 자료 이용**: `scroll_depth`의 75%·90%, `accordion_open`, `resource_open`을 함께 본다.
- **임베드 성과**: `embedded_content_view` 대비 `embedded_interaction`, 그리고 `church_video_start` → `church_video_progress` → `church_video_complete` 순서를 영상 퍼널로 만든다.
- **외부 채널로의 이동**: `outbound_click`에서 `destination_host`를 네이버지도·유튜브·인스타그램 등으로 나눈다.

이벤트별 세부 분석을 하려면 `content_type`, `content_id`, `embed_type`, `percent_scrolled`, `video_percent`, `file_extension`, `destination_host`, `entry_channel`을 이벤트 범위 맞춤 측정기준으로 등록한다. 이름·제목·검색어·입력값·URL 쿼리 문자열은 등록하지 않는다.

## 외부 채널 유입 확인

GA4의 **세션 기본 채널 그룹**(Session default channel group)이 관리자 홈의 `유입 채널`에 표시된다. 여기서 Organic Social, Organic Search, Referral, Direct, Paid Search 등의 세션과 등록 완료 수를 비교한다.

인스타그램·유튜브·카카오·네이버 등 앱은 참조 정보를 누락할 수 있으므로, 교회가 게시하는 링크에는 아래처럼 UTM을 붙인다.

| 게시 위치 | 권장 링크 예시 |
| --- | --- |
| 인스타그램 프로필·게시물 | `https://www.belovedchurch.co.kr/newcomer?utm_source=instagram&utm_medium=social&utm_campaign=newcomer` |
| 유튜브 설명란 | `https://www.belovedchurch.co.kr/newcomer?utm_source=youtube&utm_medium=social&utm_campaign=newcomer` |
| 카카오 채널·오픈채팅 공지 | `https://www.belovedchurch.co.kr/newcomer?utm_source=kakao&utm_medium=social&utm_campaign=newcomer` |
| 네이버 블로그 | `https://www.belovedchurch.co.kr/newcomer?utm_source=naver&utm_medium=referral&utm_campaign=newcomer` |
| 인쇄물 QR | `https://www.belovedchurch.co.kr/newcomer?utm_source=qr&utm_medium=offline&utm_campaign=newcomer` |

`utm_source`는 `instagram`, `youtube`, `kakao`, `naver`, `google`, `daum`, `facebook`, `tiktok`, `newsletter`, `offline`, `qr`, `linktree` 중 하나를 사용한다. `utm_medium`은 `social`, `referral`, `organic`, `paid_social`, `paid_search`, `email`, `offline`, `qr` 중 하나를 사용한다. 캠페인 이름도 사람 이름·전화번호·상담번호 없이 목적만 간단히 쓴다.

## GA4 관리 화면에서 할 일

- `generate_lead`를 **주요 이벤트(Key event)** 로 지정한다.
- 탐색(Explore)에서 위 이벤트 순서로 퍼널 탐색을 하나 만들고, `Session default channel group`, `Session source / medium`, `Session campaign`으로 세그먼트를 나눈다.
- `entry_channel`, `entry_source`, `entry_medium`, `referrer_host`를 보고서에서 별도로 쓰려면 이벤트 범위 맞춤 측정기준으로 등록한다. 콘텐츠·영상 분석도 하려면 위 `콘텐츠 이용 분석`의 측정기준을 함께 등록한다.

## 관리자 대시보드 데이터 연결

관리자 화면은 GA4 Data API에서 최근 28일의 방문·클릭·퍼널·세션 채널 그룹을 읽는다. 조직 정책상 서비스 계정의 장기 키 발급은 사용하지 않으며, 관리자 Google 계정의 읽기 전용 OAuth 토큰을 Vercel Production 환경에 보관한다.

- `GOOGLE_ANALYTICS_PROPERTY_ID`
- `GOOGLE_ANALYTICS_OAUTH_CLIENT_ID`
- `GOOGLE_ANALYTICS_OAUTH_CLIENT_SECRET`
- `GOOGLE_ANALYTICS_OAUTH_REFRESH_TOKEN`

OAuth 동의 범위는 `https://www.googleapis.com/auth/analytics.readonly`만 사용한다. OAuth 비밀값과 원문 보고 데이터는 Git에 저장하지 않는다.

OAuth 갱신 토큰을 새로 발급해야 할 때는 `scripts/authorize-google-analytics.mjs`를 사용한다. 클라이언트 JSON과 생성된 토큰 파일은 일회성으로만 다루고, Vercel 환경 변수에 저장된 뒤 즉시 로컬에서 제거한다.
