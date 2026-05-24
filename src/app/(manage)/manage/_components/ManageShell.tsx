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
  Plus,
  Radio,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { signOutAction } from '@/app/(manage)/manage/login/actions'
import type { ManageUser } from '@/lib/manage/auth'

type ActiveKey =
  | 'announcements'
  | 'banner'
  | 'bulletins'
  | 'dashboard'
  | 'guide'
  | 'home'
  | 'instagram'
  | 'menu'
  | 'offering'
  | 'sermons'
  | 'worship'

const navItems: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  key: ActiveKey
  label: string
}[] = [
  { href: '/manage', icon: LayoutDashboard, key: 'dashboard', label: '대시보드' },
  { href: '/manage/guide', icon: HelpCircle, key: 'guide', label: '관리 가이드' },
  { href: '/manage/home', icon: Home, key: 'home', label: '홈 관리' },
  { href: '/manage/worship', icon: MapPin, key: 'worship', label: '예배 안내' },
  { href: '/manage/sermons', icon: Radio, key: 'sermons', label: '설교' },
  { href: '/manage/instagram', icon: Instagram, key: 'instagram', label: '인스타그램' },
  { href: '/manage/announcements', icon: Bell, key: 'announcements', label: '공지사항' },
  { href: '/manage/bulletins', icon: FileText, key: 'bulletins', label: '주보' },
  { href: '/manage/offering', icon: HandCoins, key: 'offering', label: '헌금 안내' },
  { href: '/manage/banner', icon: Megaphone, key: 'banner', label: '상단 배너' },
  { href: '/manage/menu', icon: Menu, key: 'menu', label: '메뉴 관리' },
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
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                aria-current={active === item.key ? 'page' : undefined}
                className={`manage-nav-link${active === item.key ? ' is-active' : ''}`}
                href={item.href}
                key={item.key}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            )
          })}
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
