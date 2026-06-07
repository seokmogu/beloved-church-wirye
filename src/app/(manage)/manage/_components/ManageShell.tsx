import {
  Bell,
  BookOpen,
  FileText,
  HandCoins,
  HelpCircle,
  Home,
  Instagram,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  Menu,
  Newspaper,
  Plus,
  Radio,
  UserRound,
  Video,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { signOutAction } from '@/app/(manage)/manage/login/actions'
import type { ManageUser } from '@/lib/manage/auth'

type ActiveKey =
  | 'announcements'
  | 'banner'
  | 'bulletins'
  | 'churchNews'
  | 'dashboard'
  | 'guide'
  | 'home'
  | 'instagram'
  | 'leaders'
  | 'menu'
  | 'offering'
  | 'sermons'
  | 'videos'
  | 'worship'

type NavItem = {
  external?: boolean
  href: string
  icon: React.ComponentType<{ className?: string }>
  key?: ActiveKey
  label: string
}

type NavEntry = NavItem | { items: NavItem[]; label: string; type: 'group' }

const navSections: {
  entries: NavEntry[]
  label: string
}[] = [
  {
    entries: [
      { href: '/manage', icon: LayoutDashboard, key: 'dashboard', label: '대시보드' },
      { href: '/manage/guide', icon: HelpCircle, key: 'guide', label: '관리가이드' },
    ],
    label: '관리',
  },
  {
    entries: [
      {
        items: [
          { href: '/manage/home', icon: Home, key: 'home', label: '교회소개' },
          { href: '/manage/leaders', icon: UserRound, key: 'leaders', label: '섬기는 사람들' },
          { href: '/manage/worship', icon: MapPin, key: 'worship', label: '예배안내' },
          { external: true, href: '/newcomer', icon: Plus, label: '새가족등록' },
          { href: '/manage/bulletins', icon: FileText, key: 'bulletins', label: '주보' },
        ],
        label: '교회소개',
        type: 'group',
      },
      { href: '/manage/sermons', icon: Radio, key: 'sermons', label: '설교영상' },
      { href: '/manage/announcements', icon: Bell, key: 'announcements', label: '교회로그' },
      {
        items: [
          { href: '/manage/church-news', icon: Newspaper, key: 'churchNews', label: '교회소식' },
          { href: '/manage/videos', icon: Video, key: 'videos', label: '동영상' },
        ],
        label: '교회소식',
        type: 'group',
      },
    ],
    label: '공개메뉴',
  },
  {
    entries: [
      { href: '/manage/instagram', icon: Instagram, key: 'instagram', label: '인스타그램' },
      { href: '/manage/offering', icon: HandCoins, key: 'offering', label: '헌금안내' },
      { href: '/manage/banner', icon: Megaphone, key: 'banner', label: '상단배너' },
      { href: '/manage/menu', icon: Menu, key: 'menu', label: '메뉴관리' },
    ],
    label: '사이트관리',
  },
]

export function ManageShell({
  active,
  children,
  user,
}: {
  active: ActiveKey
  children: ReactNode
  user: ManageUser
}) {
  return (
    <div className="manage-shell">
      <aside className="manage-sidebar">
        <div className="manage-brand">
          <strong>사랑하는교회 위례</strong>
          <span>콘텐츠 관리자</span>
        </div>
        <nav className="manage-nav" aria-label="관리 메뉴">
          {navSections.map((section) => (
            <div className="manage-nav-section" key={section.label}>
              <span className="manage-nav-section-label">{section.label}</span>
              <div className="manage-nav-section-links">
                {section.entries.map((entry) =>
                  'type' in entry ? (
                    <div className="manage-nav-group" key={entry.label}>
                      <span className="manage-nav-group-label">{entry.label}</span>
                      <div className="manage-nav-group-items">
                        {entry.items.map((item) => (
                          <NavLink active={active} child item={item} key={item.key ?? item.href} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <NavLink active={active} item={entry} key={entry.key ?? entry.href} />
                  ),
                )}
              </div>
            </div>
          ))}
        </nav>
        <div className="manage-sidebar-footer">
          <Link className="manage-button ghost" href="/" target="_blank">
            <BookOpen />
            사이트 보기
          </Link>
          <form action={signOutAction}>
            <button className="manage-button ghost" type="submit">
              <LogOut />
              로그아웃
            </button>
          </form>
          <span className="manage-user">{user.email}</span>
        </div>
      </aside>
      <main className="manage-main">
        <div className="manage-main-inner">{children}</div>
      </main>
    </div>
  )
}

function NavLink({ active, child, item }: { active: ActiveKey; child?: boolean; item: NavItem }) {
  const Icon = item.icon
  const isActive = item.key ? active === item.key : false
  const className = [
    'manage-nav-link',
    child ? 'is-child' : '',
    item.external ? 'is-external' : '',
    isActive ? 'is-active' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={className}
      href={item.href}
      rel={item.external ? 'noopener noreferrer' : undefined}
      target={item.external ? '_blank' : undefined}
    >
      <Icon />
      <span>{item.label}</span>
    </Link>
  )
}

export function PageHeader({
  actionHref,
  actionLabel,
  children,
  description,
  title,
}: {
  actionHref?: string
  actionLabel?: string
  children?: ReactNode
  description?: string
  title: string
}) {
  return (
    <header className="manage-page-header">
      <div className="manage-page-title">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="manage-page-actions">
        {children}
        {actionHref && actionLabel ? (
          <Link className="manage-button" href={actionHref}>
            <Plus />
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </header>
  )
}
