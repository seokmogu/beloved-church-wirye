import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveMenuAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { Header } from '@/payload-types'

type MenuRow = {
  internalPath: string
  label: string
  newTab: boolean
  type: 'custom' | 'internal'
  url: string
}

type MenuSearchParams = Promise<Record<string, string | string[] | undefined>>

const internalPathOptions = [
  { label: '홈', value: '/' },
  { label: '교회 소개', value: '/about' },
  { label: '예배 안내', value: '/worship' },
  { label: '최신 설교', value: '/sermon' },
  { label: '공지사항', value: '/announcements' },
  { label: '교회소식', value: '/church-news' },
  { label: '주보', value: '/bulletins' },
  { label: '새가족 등록', value: '/newcomer' },
  { label: '헌금 안내', value: '/offering' },
]

export default async function ManageMenuPage({
  searchParams,
}: {
  searchParams: MenuSearchParams
}) {
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
        title="메뉴 관리"
      />
      {error === 'save' ? (
        <div className="manage-alert danger" role="alert">
          메뉴를 저장하지 못했습니다. 입력한 메뉴 항목을 확인한 뒤 다시 저장해 주세요.
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
                    <option value="internal">고정 페이지</option>
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
                  <label htmlFor={`menuInternalPath-${index}`}>고정 페이지</label>
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

function padMenuRows(items: Header['navItems']): MenuRow[] {
  const rows = (items || []).map((item) => {
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

  while (rows.length < 8) {
    rows.push({ internalPath: '/', label: '', newTab: false, type: 'internal', url: '' })
  }

  return rows
}
