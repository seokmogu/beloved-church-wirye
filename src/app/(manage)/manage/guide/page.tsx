import Link from 'next/link'

import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { requireManageUser } from '@/lib/manage/auth'

const guideSections = [
  {
    adminHref: '/manage/home',
    adminLabel: '홈 관리',
    publicHref: '/',
    publicLabel: '메인 화면',
    summary: '공개 메인 화면 프리뷰 안에서 히어로 문구, 섹션 문구, 배경 이미지, 색상, 글자 크기를 수정합니다.',
    steps: [
      '히어로 프리뷰 화면 안에서 교회명, 제목, 부제목, 버튼 문구와 링크를 직접 수정합니다.',
      '오른쪽 스타일 패널에서 배경 이미지, 컬러, 히어로/섹션 글자 크기를 조정합니다.',
      '저장 후 메인 화면에서 프리뷰와 같은 문구와 디자인 값이 적용됐는지 확인합니다.',
    ],
  },
  {
    adminHref: '/manage/worship',
    adminLabel: '예배 안내',
    publicHref: '/worship',
    publicLabel: '예배 안내 페이지',
    summary: '예배 시간, 예배 순서, 주소, 교통편, 주차 안내를 수정합니다.',
    steps: [
      '예배와 모임에는 실제 노출할 예배명과 시간을 입력합니다.',
      '오시는 길에는 주소와 지도 좌표, 대중교통과 주차 안내를 입력합니다.',
      '저장 후 예배 안내 페이지와 메인 오시는 길 영역을 확인합니다.',
    ],
  },
  {
    adminHref: '/manage/sermons',
    adminLabel: '설교',
    publicHref: '/sermon',
    publicLabel: '최신 설교 페이지',
    summary: '설교 목록을 등록하고 메인 최신 설교 섹션에 표시할 개수를 설정합니다.',
    steps: [
      '설교 추가에서 제목과 YouTube URL, 설교 날짜를 입력합니다.',
      '상태가 공개인 설교만 메인 최신 설교와 최신 설교 페이지에 표시됩니다.',
      '메인 노출 개수와 YouTube 채널 버튼 링크는 설교 관리 상단 설정에서 수정합니다.',
    ],
  },
  {
    adminHref: '/manage/instagram',
    adminLabel: '인스타그램',
    publicHref: '/',
    publicLabel: '메인 인스타그램 섹션',
    summary: '메인 화면 인스타그램 섹션의 계정 링크와 노출 게시물을 수정합니다.',
    steps: [
      'Instagram URL에는 계정 주소를 입력하고 계정명에는 화면에 보일 이름을 입력합니다.',
      '게시물 ID에는 Instagram 주소의 /p/ 또는 /reel/ 뒤에 오는 값을 입력합니다.',
      '홈 관리에서 인스타그램 섹션이 표시 상태인지 함께 확인합니다.',
    ],
  },
  {
    adminHref: '/manage/announcements',
    adminLabel: '공지사항',
    publicHref: '/announcements',
    publicLabel: '공지사항 게시판',
    summary: '공지 글을 등록하면 공지사항 게시판과 메인 공지 섹션에 노출됩니다.',
    steps: [
      '공지 추가에서 제목, 내용, 게시일을 입력합니다.',
      '상단 고정을 체크하면 게시판에서 공지 배지가 붙습니다.',
      '저장 후 공지사항 게시판과 메인 공지 섹션을 확인합니다.',
    ],
  },
  {
    adminHref: '/manage/bulletins',
    adminLabel: '주보',
    publicHref: '/bulletins',
    publicLabel: '주보 페이지',
    summary: '주보 제목, 날짜, 공개 여부, 메모를 관리합니다.',
    steps: [
      '주보 추가에서 날짜와 제목 또는 설교 메모를 입력합니다.',
      '공개를 체크한 항목만 공개 주보 페이지에 표시됩니다.',
      '파일이 없어도 제목과 날짜는 먼저 등록할 수 있습니다.',
    ],
  },
  {
    adminHref: '/manage/offering',
    adminLabel: '헌금 안내',
    publicHref: '/offering',
    publicLabel: '헌금 안내 페이지',
    summary: '헌금 안내 문구, 계좌 정보, 안내 사항, 성경 구절, 헌금 종류를 수정합니다.',
    steps: [
      '계좌 정보는 은행명, 계좌번호, 예금주가 모두 있을 때 저장됩니다.',
      '헌금 종류는 제목과 설명이 모두 있을 때 목록에 표시됩니다.',
      '저장하면 상단 메뉴에 헌금 안내 링크가 없을 때 자동으로 추가됩니다. 노출 위치와 문구는 메뉴 관리에서 조정합니다.',
      '저장 후 헌금 안내 페이지에서 계좌 복사 버튼과 안내 문구를 확인합니다.',
    ],
  },
  {
    adminHref: '/manage/banner',
    adminLabel: '상단 배너',
    publicHref: '/',
    publicLabel: '사이트 상단 배너',
    summary: '기간을 지정해 사이트 상단에 임시 안내 배너를 노출합니다.',
    steps: [
      '배너 활성화를 체크하고 메인 텍스트와 종료일을 입력합니다.',
      '시작일을 비워두면 즉시 표시되고 종료일이 지나면 자동으로 숨겨집니다.',
      '색상은 배경색과 글자색을 각각 지정합니다.',
    ],
  },
  {
    adminHref: '/manage/menu',
    adminLabel: '메뉴 관리',
    publicHref: '/',
    publicLabel: '상단 메뉴',
    summary: '공개 사이트 상단 내비게이션의 메뉴명, 순서, 링크를 수정합니다.',
    steps: [
      '빈 메뉴명 행은 저장 시 제외됩니다.',
      '고정 페이지는 준비된 공개 페이지로 연결하고, 직접 주소는 외부 링크에 사용합니다.',
      '저장 후 메인 화면 상단 메뉴에서 링크가 원하는 페이지로 이동하는지 확인합니다.',
    ],
  },
]

export default async function ManageGuidePage() {
  const user = await requireManageUser()

  return (
    <ManageShell active="guide" user={user}>
      <PageHeader
        description="관리 화면과 공개 화면이 어떻게 연결되는지 확인하고 수정 순서를 따릅니다."
        title="관리 가이드"
      />

      <section className="manage-guide-layout">
        {guideSections.map((section) => (
          <article className="manage-guide-card" key={section.adminHref}>
            <div>
              <h2>{section.adminLabel}</h2>
              <p>{section.summary}</p>
            </div>
            <div className="manage-guide-meta">
              <Link className="manage-badge" href={section.adminHref}>
                관리자: {section.adminLabel}
              </Link>
              <Link className="manage-badge draft" href={section.publicHref} target="_blank">
                공개 화면: {section.publicLabel}
              </Link>
            </div>
            <ol className="manage-guide-steps">
              {section.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </section>
    </ManageShell>
  )
}
