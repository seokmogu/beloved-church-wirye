import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveMenuAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { Header } from '@/payload-types'

type MenuLinkRow = {
  internalPath: string
  label: string
  newTab: boolean
  type: 'custom' | 'internal'
  url: string
}
type MenuRow = MenuLinkRow & {
  children: MenuLinkRow[]
}

type MenuSearchParams = Promise<Record<string, string | string[] | undefined>>

const internalPathOptions = [
  { label: '홈', value: '/' },
  { label: '교회소개', value: '/about' },
  { label: '섬기는 사람들', value: '/about/leaders' },
  { label: '예배안내', value: '/worship' },
  { label: '새가족등록', value: '/newcomer' },
  { label: '주보', value: '/bulletins' },
  { label: '설교영상', value: '/sermon' },
  { label: '공지사항', value: '/announcements' },
  { label: '교회소식', value: '/church-news' },
  { label: '동영상', value: '/church-news/videos' },
  { label: '헌금안내', value: '/offering' },
]

const publicMenuStructure = [
  {
    children: ['교회소개', '섬기는 사람들', '예배안내', '새가족등록'],
    label: '교회소개',
  },
  { label: '설교영상' },
  { label: '교회로그' },
  { children: ['교회소식', '동영상', '주보'], label: '교회소식' },
]

export default async function ManageMenuPage({ searchParams }: { searchParams: MenuSearchParams }) {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const params = await searchParams
  const error = getStringParam(params.error)
  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  const rows = padMenuRows(header.navItems)

  return (
    <ManageShell active="menu" user={user}>
      <PageHeader
        description="공개 사이트 상단 내비게이션에 표시되는 메뉴를 관리합니다."
        title="메뉴관리"
      />
      <section className="manage-menu-structure" aria-label="현재 공개 메뉴 구조">
        {publicMenuStructure.map((item) => (
          <div className="manage-menu-structure-item" key={item.label}>
            <strong>{item.label}</strong>
            {item.children ? (
              <ul>
                {item.children.map((child) => (
                  <li key={child}>{child}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </section>
      {error === 'save' ? (
        <div className="manage-alert danger" role="alert">
          메뉴를 저장하지 못했습니다. 입력한 메뉴항목을 확인한 뒤 다시 저장해 주세요.
        </div>
      ) : null}
      <form action={saveMenuAction} className="manage-form">
        <section className="manage-grid">
          {rows.map((row, index) => (
            <div className="manage-subform" key={index}>
              <div className="manage-field-grid cols-3">
                <div className="manage-field">
                  <label htmlFor={`menuLabel-${index}`}>메뉴명</label>
                  <input defaultValue={row.label} id={`menuLabel-${index}`} name="menuLabel" />
                </div>
                <div className="manage-field">
                  <label htmlFor={`menuType-${index}`}>종류</label>
                  <select defaultValue={row.type} id={`menuType-${index}`} name="menuType">
                    <option value="internal">고정페이지</option>
                    <option value="custom">직접 주소</option>
                  </select>
                </div>
                <label className="manage-checkbox menu-checkbox" htmlFor={`menuNewTab-${index}`}>
                  <input
                    defaultChecked={row.newTab}
                    id={`menuNewTab-${index}`}
                    name={`menuNewTab-${index}`}
                    type="checkbox"
                  />
                  새 창
                </label>
              </div>
              <div className="manage-field-grid">
                <div className="manage-field">
                  <label htmlFor={`menuInternalPath-${index}`}>고정페이지</label>
                  <select
                    defaultValue={row.internalPath}
                    id={`menuInternalPath-${index}`}
                    name="menuInternalPath"
                  >
                    {internalPathOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="manage-field">
                  <label htmlFor={`menuUrl-${index}`}>직접 주소</label>
                  <input defaultValue={row.url} id={`menuUrl-${index}`} name="menuUrl" />
                </div>
              </div>
              <div className="manage-submenu-block">
                <div className="manage-submenu-title">
                  <h3>하위메뉴</h3>
                  <p>상위 메뉴 아래에 표시할 링크가 있을 때만 입력합니다.</p>
                </div>
                {row.children.map((child, childIndex) => (
                  <div className="manage-submenu-row" key={childIndex}>
                    <div className="manage-field-grid cols-3">
                      <div className="manage-field">
                        <label htmlFor={`menuChildLabel-${index}-${childIndex}`}>하위메뉴명</label>
                        <input
                          defaultValue={child.label}
                          id={`menuChildLabel-${index}-${childIndex}`}
                          name={`menuChildLabel-${index}`}
                        />
                      </div>
                      <div className="manage-field">
                        <label htmlFor={`menuChildType-${index}-${childIndex}`}>종류</label>
                        <select
                          defaultValue={child.type}
                          id={`menuChildType-${index}-${childIndex}`}
                          name={`menuChildType-${index}`}
                        >
                          <option value="internal">고정페이지</option>
                          <option value="custom">직접 주소</option>
                        </select>
                      </div>
                      <label
                        className="manage-checkbox menu-checkbox"
                        htmlFor={`menuChildNewTab-${index}-${childIndex}`}
                      >
                        <input
                          defaultChecked={child.newTab}
                          id={`menuChildNewTab-${index}-${childIndex}`}
                          name={`menuChildNewTab-${index}-${childIndex}`}
                          type="checkbox"
                        />
                        새 창
                      </label>
                    </div>
                    <div className="manage-field-grid">
                      <div className="manage-field">
                        <label htmlFor={`menuChildInternalPath-${index}-${childIndex}`}>
                          고정페이지
                        </label>
                        <select
                          defaultValue={child.internalPath}
                          id={`menuChildInternalPath-${index}-${childIndex}`}
                          name={`menuChildInternalPath-${index}`}
                        >
                          {internalPathOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="manage-field">
                        <label htmlFor={`menuChildUrl-${index}-${childIndex}`}>직접 주소</label>
                        <input
                          defaultValue={child.url}
                          id={`menuChildUrl-${index}-${childIndex}`}
                          name={`menuChildUrl-${index}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="manage-form-actions">
          <Link className="manage-button secondary" href="/manage">
            취소
          </Link>
          <SaveButton />
        </div>
      </form>
    </ManageShell>
  )
}

function getStringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

const blankMenuRow: MenuLinkRow = {
  internalPath: '/',
  label: '',
  newTab: false,
  type: 'internal',
  url: '',
}

function padMenuRows(items: Header['navItems']): MenuRow[] {
  const rows: MenuRow[] = (items || []).map((item) => {
    const link = item.link
    const isCustom = link.type === 'custom'

    return {
      children: padChildRows(item.children),
      internalPath: link.internalPath || '/',
      label: link.label || '',
      newTab: Boolean(link.newTab),
      type: isCustom ? ('custom' as const) : ('internal' as const),
      url: link.url || '',
    }
  })

  while (rows.length < 8) {
    rows.push({ ...blankMenuRow, children: padChildRows() })
  }

  return rows
}

function padChildRows(items?: NonNullable<Header['navItems']>[number]['children']): MenuLinkRow[] {
  const rows: MenuLinkRow[] = (items || []).map((item) => {
    const link = item.link
    const isCustom = link.type === 'custom'

    return {
      internalPath: link.internalPath || '/',
      label: link.label || '',
      newTab: Boolean(link.newTab),
      type: isCustom ? ('custom' as const) : ('internal' as const),
      url: link.url || '',
    }
  })

  while (rows.length < 3) rows.push({ ...blankMenuRow })

  return rows
}
