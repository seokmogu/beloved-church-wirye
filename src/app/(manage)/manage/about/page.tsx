import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveAboutSettingsAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'
import type { SiteSetting } from '@/payload-types'

type CoreValue = NonNullable<SiteSetting['coreValues']>[number]

export default async function ManageAboutPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const [settings, footer] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
    payload.findGlobal({ slug: 'footer', depth: 0 }),
  ])
  const coreValues = padRows<CoreValue>(settings.coreValues, 3, { description: '', title: '' })

  return (
    <ManageShell active="about" user={user}>
      <PageHeader
        description="교회소개 페이지의 비전, 소개 본문, 핵심 가치와 연락처를 관리합니다."
        title="교회소개"
      >
        <Link className="manage-button secondary" href="/about" target="_blank">
          공개페이지 보기
        </Link>
      </PageHeader>
      <form action={saveAboutSettingsAction} className="manage-form">
        <div className="manage-field-grid">
          <div className="manage-field">
            <label htmlFor="churchVision">비전</label>
            <input
              defaultValue={settings.churchVision || ''}
              id="churchVision"
              name="churchVision"
            />
          </div>
          <div className="manage-field">
            <label htmlFor="denomination">교단</label>
            <input
              defaultValue={settings.denomination || ''}
              id="denomination"
              name="denomination"
            />
          </div>
        </div>
        <div className="manage-field">
          <label htmlFor="churchDescription">교회소개 본문</label>
          <textarea
            defaultValue={settings.churchDescription || ''}
            id="churchDescription"
            name="churchDescription"
            rows={6}
          />
        </div>
        <div className="manage-field">
          <label htmlFor="churchQuote">인용 문구</label>
          <textarea
            defaultValue={settings.churchQuote || ''}
            id="churchQuote"
            name="churchQuote"
            rows={2}
          />
        </div>

        <div className="manage-field-grid">
          <div className="manage-field">
            <label htmlFor="churchPhone">전화번호 (사이트 하단에 표기)</label>
            <input
              defaultValue={footer.churchPhone || ''}
              id="churchPhone"
              name="churchPhone"
              placeholder="예: 02-123-4567"
            />
          </div>
          <div className="manage-field">
            <label htmlFor="footerAddress">주소 (사이트 하단에 표기)</label>
            <input
              defaultValue={footer.address || ''}
              id="footerAddress"
              name="footerAddress"
            />
          </div>
        </div>

        <div className="manage-field">
          <label>핵심 가치 (제목과 설명을 모두 채운 항목만 노출됩니다)</label>
        </div>
        {coreValues.map((value, index) => (
          <div className="manage-field-grid" key={index}>
            <div className="manage-field">
              <label htmlFor={`coreValueTitle-${index}`}>핵심 가치 {index + 1} 제목</label>
              <input
                defaultValue={value.title}
                id={`coreValueTitle-${index}`}
                name="coreValueTitle"
              />
            </div>
            <div className="manage-field">
              <label htmlFor={`coreValueDescription-${index}`}>설명</label>
              <input
                defaultValue={value.description}
                id={`coreValueDescription-${index}`}
                name="coreValueDescription"
              />
            </div>
          </div>
        ))}

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

function padRows<T>(rows: T[] | null | undefined, minLength: number, blank: T): T[] {
  const filled = [...(rows || [])]
  while (filled.length < minLength) filled.push(blank)
  return filled
}
