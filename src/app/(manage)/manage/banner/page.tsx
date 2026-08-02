import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveBannerAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { toDateInputValue } from '@/lib/manage/date'
import { getManagePayload } from '@/lib/manage/payload'

type ManageBannerPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function ManageBannerPage({ searchParams }: ManageBannerPageProps) {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const banner = await payload.findGlobal({ slug: 'special-banner' })
  const { error } = await searchParams

  return (
    <ManageShell active="banner" user={user}>
      <PageHeader title="상단 배너" />
      <form action={saveBannerAction} className="manage-form">
        <label className="manage-checkbox">
          <input defaultChecked={Boolean(banner.enabled)} name="enabled" type="checkbox" />
          <span>배너 활성화</span>
        </label>
        <div className="manage-field">
          <label htmlFor="text">메인 텍스트</label>
          <input defaultValue={banner.text || ''} id="text" name="text" />
          <p className="manage-field-hint">배너를 활성화할 때만 입력하면 됩니다.</p>
        </div>
        {error === 'text' ? (
          <div className="manage-alert danger" role="alert">
            배너를 활성화하려면 메인 텍스트를 입력해 주세요.
          </div>
        ) : error === 'save' ? (
          <div className="manage-alert danger" role="alert">
            배너를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.
          </div>
        ) : null}
        <div className="manage-field">
          <label htmlFor="subtext">서브 텍스트</label>
          <input defaultValue={banner.subtext || ''} id="subtext" name="subtext" />
        </div>
        <div className="manage-field-grid">
          <div className="manage-field">
            <label htmlFor="backgroundColor">배경색</label>
            <input
              defaultValue={banner.backgroundColor || '#1B3A2D'}
              id="backgroundColor"
              name="backgroundColor"
              type="color"
            />
          </div>
          <div className="manage-field">
            <label htmlFor="textColor">글자색</label>
            <input
              defaultValue={banner.textColor || '#ffffff'}
              id="textColor"
              name="textColor"
              type="color"
            />
          </div>
        </div>
        <div className="manage-field-grid">
          <div className="manage-field">
            <label htmlFor="startDate">시작일</label>
            <input
              defaultValue={toDateInputValue(banner.startDate)}
              id="startDate"
              name="startDate"
              type="date"
            />
          </div>
          <div className="manage-field">
            <label htmlFor="endDate">종료일</label>
            <input
              defaultValue={toDateInputValue(banner.endDate)}
              id="endDate"
              name="endDate"
              required
              type="date"
            />
          </div>
        </div>
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
