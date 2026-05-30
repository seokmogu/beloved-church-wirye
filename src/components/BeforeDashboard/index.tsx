import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

const quickLinks = [
  {
    description: '히어로, 섹션 추가/삭제, 순서, 제목, 설명',
    href: '/admin/globals/site-settings',
    label: '홈페이지 빌더',
    meta: '가장 많이 수정',
  },
  {
    description: '상단메뉴 추가, 삭제, 순서 변경',
    href: '/admin/globals/header',
    label: '상단메뉴',
    meta: '메뉴관리',
  },
  {
    description: '사역 소개처럼 별도로 필요한 독립 페이지 생성',
    href: '/admin/collections/pages',
    label: '일반 페이지',
    meta: '독립 페이지',
  },
  {
    description: '공지 글 작성 후 /announcements 게시판에 자동 노출',
    href: '/admin/collections/announcements',
    label: '공지사항 게시판',
    meta: '콘텐츠 게시판',
  },
  {
    description: '새가족 신청 확인과 연락 상태 기록',
    href: '/admin/collections/newcomers',
    label: '새가족',
    meta: '문의/신청',
  },
  {
    description: '이미지, PDF, QR 코드 파일 보관',
    href: '/admin/collections/media',
    label: '이미지/파일',
    meta: '자료실',
  },
]

const secondaryLinks = [
  { href: '/admin/globals/footer', label: '하단 메뉴/푸터' },
  { href: '/admin/globals/special-banner', label: '상단 알림 배너' },
  { href: '/admin/globals/offering-page', label: '헌금안내페이지' },
  { href: '/admin/collections/bulletins', label: '주보' },
  { href: '/admin/collections/sermons', label: '설교' },
  { href: '/', label: '사이트 열기' },
]

const fixedPageLinks = [
  {
    description: '히어로와 홈 섹션 추가, 삭제, 순서 변경',
    href: '/admin/globals/site-settings',
    label: '홈 메인 화면',
  },
  {
    description: '교회소개, 목회자, 핵심 가치',
    href: '/admin/globals/site-settings',
    label: '교회 정보',
  },
  {
    description: '예배 시간, 예배 순서, 주소, 주차, 지도',
    href: '/admin/globals/site-settings',
    label: '예배/오시는 길',
  },
  {
    description: '최신 설교 페이지에 노출되는 설교영상',
    href: '/admin/collections/sermons',
    label: '최신 설교',
  },
  {
    description: '공지사항 목록과 상세 페이지',
    href: '/admin/collections/announcements',
    label: '공지사항',
  },
  {
    description: '주보 PDF와 이미지 자료',
    href: '/admin/collections/bulletins',
    label: '주보',
  },
  {
    description: '헌금 계좌, 안내 문구, 헌금 종류',
    href: '/admin/globals/offering-page',
    label: '헌금안내',
  },
]

const BeforeDashboard: React.FC = () => {
  return (
    <section className={baseClass}>
      <div className={`${baseClass}__header`}>
        <p className={`${baseClass}__eyebrow`}>CMS 홈</p>
        <h2>위례 사랑하는교회 사이트 관리</h2>
      </div>

      <div className={`${baseClass}__grid`}>
        {quickLinks.map((link) => (
          <a className={`${baseClass}__card`} href={link.href} key={link.href}>
            <span className={`${baseClass}__meta`}>{link.meta}</span>
            <strong>{link.label}</strong>
            <span>{link.description}</span>
          </a>
        ))}
      </div>

      <div className={`${baseClass}__fixed-pages`}>
        <h3>기본 페이지와 콘텐츠 게시판 관리 위치</h3>
        <div className={`${baseClass}__fixed-grid`}>
          {fixedPageLinks.map((link) => (
            <a href={link.href} key={`${link.href}-${link.label}`}>
              <strong>{link.label}</strong>
              <span>{link.description}</span>
            </a>
          ))}
        </div>
      </div>

      <div className={`${baseClass}__shortcuts`} aria-label="추가 바로가기">
        {secondaryLinks.map((link) => (
          <a href={link.href} key={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </section>
  )
}

export default BeforeDashboard
