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
        description="저장하면 공개 헌금안내페이지에 반영됩니다. 상단메뉴 노출은 메뉴관리에서 직접 설정합니다."
        title="헌금안내"
      >
        <Link className="manage-button secondary" href="/manage/menu">
          메뉴관리
        </Link>
        <Link className="manage-button" href="/offering" target="_blank">
          공개페이지 보기
        </Link>
      </PageHeader>
      <form action={saveOfferingAction} className="manage-visual-form manage-public-editor">
        <div className="manage-editor-toolbar">
          <Link className="manage-button secondary" href="/manage">
            취소
          </Link>
          <SaveButton />
        </div>

        <div className="manage-public-canvas narrow">
          <section className="manage-public-hero">
            <p>OFFERING</p>
            <h2>헌금안내</h2>
            <span>하나님께 드리는 감사와 헌신의 예물</span>
          </section>

          <section className="manage-public-section centered">
            <label className="manage-visual-field muted intro" htmlFor="introText">
              <span>소개 문구</span>
              <textarea
                defaultValue={offering.introText || ''}
                id="introText"
                name="introText"
                rows={5}
              />
            </label>
          </section>

          <section className="manage-public-section">
            <div className="manage-public-section-head">
              <div>
                <p>Bank Account</p>
                <h2>계좌 이체</h2>
              </div>
              <span className="manage-scope-chip">/offering 계좌 카드</span>
            </div>

            <div className="manage-offering-account-list">
              {bankAccounts.map((account, index) => (
                <article className="manage-public-card edit-card" key={index}>
                  <div className="manage-offering-row">
                    <span>은행</span>
                    <label className="manage-visual-field inline" htmlFor={`bankName-${index}`}>
                      <span>은행명</span>
                      <input
                        defaultValue={account.bankName}
                        id={`bankName-${index}`}
                        name="bankName"
                      />
                    </label>
                  </div>
                  <div className="manage-offering-row">
                    <span>계좌번호</span>
                    <label
                      className="manage-visual-field inline mono"
                      htmlFor={`accountNumber-${index}`}
                    >
                      <span>계좌번호</span>
                      <input
                        defaultValue={account.accountNumber}
                        id={`accountNumber-${index}`}
                        name="accountNumber"
                      />
                    </label>
                  </div>
                  <div className="manage-offering-row last">
                    <span>예금주</span>
                    <label
                      className="manage-visual-field inline"
                      htmlFor={`accountHolder-${index}`}
                    >
                      <span>예금주</span>
                      <input
                        defaultValue={account.accountHolder}
                        id={`accountHolder-${index}`}
                        name="accountHolder"
                      />
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="manage-public-section">
            <label className="manage-public-alert-card manage-visual-field muted" htmlFor="notes">
              <span>안내 사항</span>
              <textarea defaultValue={offering.notes || ''} id="notes" name="notes" rows={5} />
            </label>
          </section>

          <section className="manage-public-section">
            <article className="manage-public-quote-card">
              <label className="manage-visual-field quote" htmlFor="bibleVerse">
                <span>성경 구절</span>
                <textarea
                  defaultValue={offering.bibleVerse || ''}
                  id="bibleVerse"
                  name="bibleVerse"
                  rows={4}
                />
              </label>
              <label className="manage-visual-field accent reference" htmlFor="bibleReference">
                <span>성경 구절 출처</span>
                <input
                  defaultValue={offering.bibleReference || ''}
                  id="bibleReference"
                  name="bibleReference"
                />
              </label>
            </article>
          </section>

          <section className="manage-public-section centered">
            <div className="manage-public-card">
              <div className="manage-public-section-head compact">
                <div>
                  <p>Offering Types</p>
                  <h2>헌금의 종류</h2>
                </div>
              </div>
              <div className="manage-public-card-grid three">
                {offeringTypes.map((type, index) => (
                  <article className="manage-offering-type-editor" key={index}>
                    <label
                      className="manage-visual-field strong"
                      htmlFor={`offeringTypeTitle-${index}`}
                    >
                      <span>종류</span>
                      <input
                        defaultValue={type.title}
                        id={`offeringTypeTitle-${index}`}
                        name="offeringTypeTitle"
                      />
                    </label>
                    <label
                      className="manage-visual-field muted"
                      htmlFor={`offeringTypeDescription-${index}`}
                    >
                      <span>설명</span>
                      <textarea
                        defaultValue={type.description}
                        id={`offeringTypeDescription-${index}`}
                        name="offeringTypeDescription"
                        rows={2}
                      />
                    </label>
                  </article>
                ))}
              </div>
            </div>
          </section>
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
