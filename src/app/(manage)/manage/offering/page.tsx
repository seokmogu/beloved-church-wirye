import Link from 'next/link'

import { SaveButton } from '@/app/(manage)/manage/_components/FormButtons'
import { ManageShell, PageHeader } from '@/app/(manage)/manage/_components/ManageShell'
import { saveOfferingAction } from '@/app/(manage)/manage/actions'
import { requireManageUser } from '@/lib/manage/auth'
import { getManagePayload } from '@/lib/manage/payload'

export default async function ManageOfferingPage() {
  const user = await requireManageUser()
  const payload = await getManagePayload()
  const offering = await payload.findGlobal({ slug: 'offering-page' })
  const bankAccounts = padBankAccounts(offering.bankAccounts)
  const offeringTypes = padOfferingTypes(offering.offeringTypes)

  return (
    <ManageShell active="offering" user={user}>
      <PageHeader
        description="저장하면 공개 헌금 안내 페이지에 반영됩니다. 상단 메뉴 노출은 메뉴 관리에서 직접 설정합니다."
        title="헌금 안내"
      >
        <Link className="manage-button secondary" href="/manage/menu">
          메뉴 관리
        </Link>
        <Link className="manage-button" href="/offering" target="_blank">
          공개 페이지 보기
        </Link>
      </PageHeader>
      <form action={saveOfferingAction} className="manage-form">
        <div className="manage-field">
          <label htmlFor="introText">소개 문구</label>
          <textarea
            defaultValue={offering.introText || ''}
            id="introText"
            name="introText"
            rows={5}
          />
        </div>

        <section className="manage-grid">
          <h2 className="manage-section-title">계좌 정보</h2>
          {bankAccounts.map((account, index) => (
            <div className="manage-field-grid cols-3" key={index}>
              <div className="manage-field">
                <label htmlFor={`bankName-${index}`}>은행명</label>
                <input defaultValue={account.bankName} id={`bankName-${index}`} name="bankName" />
              </div>
              <div className="manage-field">
                <label htmlFor={`accountNumber-${index}`}>계좌번호</label>
                <input
                  defaultValue={account.accountNumber}
                  id={`accountNumber-${index}`}
                  name="accountNumber"
                />
              </div>
              <div className="manage-field">
                <label htmlFor={`accountHolder-${index}`}>예금주</label>
                <input
                  defaultValue={account.accountHolder}
                  id={`accountHolder-${index}`}
                  name="accountHolder"
                />
              </div>
            </div>
          ))}
        </section>

        <div className="manage-field">
          <label htmlFor="notes">안내 사항</label>
          <textarea defaultValue={offering.notes || ''} id="notes" name="notes" rows={5} />
        </div>
        <div className="manage-field">
          <label htmlFor="bibleVerse">성경 구절</label>
          <textarea
            defaultValue={offering.bibleVerse || ''}
            id="bibleVerse"
            name="bibleVerse"
            rows={4}
          />
        </div>
        <div className="manage-field">
          <label htmlFor="bibleReference">성경 구절 출처</label>
          <input
            defaultValue={offering.bibleReference || ''}
            id="bibleReference"
            name="bibleReference"
          />
        </div>

        <section className="manage-grid">
          <h2 className="manage-section-title">헌금 종류</h2>
          {offeringTypes.map((type, index) => (
            <div className="manage-field-grid" key={index}>
              <div className="manage-field">
                <label htmlFor={`offeringTypeTitle-${index}`}>종류</label>
                <input
                  defaultValue={type.title}
                  id={`offeringTypeTitle-${index}`}
                  name="offeringTypeTitle"
                />
              </div>
              <div className="manage-field">
                <label htmlFor={`offeringTypeDescription-${index}`}>설명</label>
                <input
                  defaultValue={type.description}
                  id={`offeringTypeDescription-${index}`}
                  name="offeringTypeDescription"
                />
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

type BankAccountRow = { accountHolder: string; accountNumber: string; bankName: string }
type OfferingTypeRow = { description: string; title: string }

function padBankAccounts(rows: BankAccountRow[] | null | undefined): BankAccountRow[] {
  const blank = { accountHolder: '', accountNumber: '', bankName: '' }
  const filled = [...(rows || [])]
  while (filled.length < 5) filled.push(blank)
  return filled
}

function padOfferingTypes(rows: OfferingTypeRow[] | null | undefined): OfferingTypeRow[] {
  const blank = { description: '', title: '' }
  const filled = [...(rows || [])]
  while (filled.length < 5) filled.push(blank)
  return filled
}
