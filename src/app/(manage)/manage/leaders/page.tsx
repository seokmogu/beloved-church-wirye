import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveLeadersSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { Media } from '@/payload-types'

export default async function ManageLeadersPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const pastorPhotoUrl = getMediaUrl(settings.pastorPhoto as Media | number | null | undefined)

  return (
    <ManageShell active="leaders" user={user}>
      <PageHeader
        description="섬기는 사람들 페이지에 표시되는 담임목사 소개와 사진을 관리합니다."
        title="섬기는 사람들"
      >
        <Link className="manage-button secondary" href="/about/leaders" target="_blank">
          공개페이지 보기
        </Link>
      </PageHeader>
      <form
        action={saveLeadersSettingsAction}
        className="manage-form"
        encType="multipart/form-data"
      >
        <div className="manage-field-grid">
          <div className="manage-field">
            <label htmlFor="pastorName">이름</label>
            <input defaultValue={settings.pastorName || ''} id="pastorName" name="pastorName" />
          </div>
          <div className="manage-field">
            <label htmlFor="pastorTitle">직함</label>
            <input defaultValue={settings.pastorTitle || ''} id="pastorTitle" name="pastorTitle" />
          </div>
        </div>

        <div className="manage-field">
          <label htmlFor="pastorBio">소개</label>
          <textarea defaultValue={settings.pastorBio || ''} id="pastorBio" name="pastorBio" />
        </div>

        <div className="manage-field">
          <label htmlFor="pastorQuote">인용 문구</label>
          <input defaultValue={settings.pastorQuote || ''} id="pastorQuote" name="pastorQuote" />
        </div>

        <div className="manage-media-control">
          <div>
            <strong>담임목사 사진</strong>
            <div
              aria-hidden="true"
              className="manage-media-thumb"
              style={pastorPhotoUrl ? { backgroundImage: cssUrl(pastorPhotoUrl) } : undefined}
            />
          </div>
          <label htmlFor="pastorPhotoFile">
            이미지 선택
            <input accept="image/*" id="pastorPhotoFile" name="pastorPhotoFile" type="file" />
          </label>
          <label className="manage-checkbox compact" htmlFor="clearPastorPhoto">
            <input id="clearPastorPhoto" name="clearPastorPhoto" type="checkbox" />
            제거
          </label>
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

function getMediaUrl(media: Media | number | null | undefined): string | null {
  return media && typeof media === 'object' && media.url ? media.url : null
}

function cssUrl(url: string) {
  return `url(${JSON.stringify(url)})`
}
