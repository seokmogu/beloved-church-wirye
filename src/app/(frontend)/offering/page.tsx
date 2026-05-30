import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PageHero } from '@/components/PageHero'
import { CopyAccountButton } from '@/components/CopyAccountButton'

export const metadata: Metadata = {
  title: '헌금안내 | 사랑하는교회',
  description: '사랑하는교회 위례 헌금안내 - 은행 계좌 및 카카오페이 송금 방법',
}

export const dynamic = 'force-dynamic'

export default async function OfferingPage() {
  const payload = await getPayload({ config })
  const data = await payload.findGlobal({ slug: 'offering-page' })

  const introText = data.introText ?? ''
  const bankAccounts = data.bankAccounts ?? []
  const notes = data.notes ?? ''
  const bibleVerse = data.bibleVerse ?? ''
  const bibleReference = data.bibleReference ?? ''
  const offeringTypes = data.offeringTypes ?? []

  return (
    <main className="min-h-screen bg-background">
      <PageHero label="OFFERING" title="헌금안내" subtitle="하나님께 드리는 감사와 헌신의 예물" />

      <div className="container py-16 max-w-4xl">
        {/* Intro */}
        {introText && (
          <section className="mb-16 text-center">
            <div className="prose prose-lg mx-auto text-muted-foreground">
              {introText.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </section>
        )}

        {/* Bank Accounts */}
        {bankAccounts.map((account, index) => (
          <section key={account.id ?? index} className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">계좌 이체</h2>
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground font-medium">은행</span>
                  <span className="text-foreground text-lg font-semibold">{account.bankName}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground font-medium">계좌번호</span>
                  <span className="text-foreground text-lg font-mono font-semibold">
                    {account.accountNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground font-medium">예금주</span>
                  <span className="text-foreground text-lg font-semibold">
                    {account.accountHolder}
                  </span>
                </div>
              </div>

              <CopyAccountButton accountNumber={account.accountNumber} />
            </div>
          </section>
        ))}

        {/* Notes */}
        {notes && (
          <section className="mb-12">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>💡</span>
                <span>안내 사항</span>
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">{notes}</p>
            </div>
          </section>
        )}

        {/* Bible Verse */}
        {bibleVerse && (
          <section className="bg-card border border-border rounded-lg p-8 text-center">
            <blockquote className="text-lg italic text-muted-foreground mb-4 whitespace-pre-line">
              &ldquo;{bibleVerse}&rdquo;
            </blockquote>
            {bibleReference && (
              <cite className="text-sm text-primary font-semibold">{bibleReference}</cite>
            )}
          </section>
        )}

        {/* Offering Types */}
        {offeringTypes.length > 0 && (
          <section className="mt-12 text-center">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center justify-center gap-2">
                <span>💳</span>
                <span>헌금의 종류</span>
              </h3>
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                {offeringTypes.map((type, index) => (
                  <div key={type.id ?? index}>
                    <h4 className="font-semibold text-foreground mb-2">{type.title}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
