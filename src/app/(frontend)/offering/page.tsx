import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Media, SiteSetting } from '@/payload-types'
import Image from 'next/image'
import { CopyAccountButton } from '@/components/CopyAccountButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '헌금 안내 | 사랑하는교회',
  description: '사랑하는교회 위례 헌금 안내 - 은행 계좌 및 카카오페이 송금 방법',
}

export default async function OfferingPage() {
  const payload = await getPayload({ config: configPromise })
  const siteSettings = (await payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
  })) as SiteSetting

  const {
    offeringBankName,
    offeringAccountNumber,
    offeringAccountHolder,
    offeringKakaoPayQr,
    offeringNotes,
  } = siteSettings

  const kakaoPayQrImage =
    offeringKakaoPayQr && typeof offeringKakaoPayQr !== 'string'
      ? (offeringKakaoPayQr as Media)
      : null

  // 헌금 정보가 하나도 없을 경우
  const hasOfferingInfo =
    offeringBankName || offeringAccountNumber || offeringAccountHolder || kakaoPayQrImage

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label="OFFERING"
        title="헌금 안내"
        subtitle="하나님께 드리는 감사와 헌신의 예물"
      />

      <div className="container py-16 max-w-4xl">
        {/* Intro */}
        <section className="mb-16 text-center">
          <div className="prose prose-lg mx-auto text-muted-foreground">
            <p>
              헌금은 하나님께 드리는 감사와 헌신의 표현입니다.
              <br />
              여러분의 귀한 헌금은 복음 전파와 교회 사역에 사용됩니다.
            </p>
          </div>
        </section>

        {!hasOfferingInfo ? (
          // 헌금 정보 미등록 상태
          <section className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              헌금 정보가 등록되지 않았습니다
            </h2>
            <p className="text-muted-foreground">
              관리자에게 문의하시거나 예배 시간에 직접 헌금해 주시기 바랍니다.
            </p>
          </section>
        ) : (
          <>
            {/* Bank Account */}
            {(offeringBankName || offeringAccountNumber || offeringAccountHolder) && (
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">계좌 이체</h2>
                <div className="bg-card border border-border rounded-lg p-8">
                  <div className="space-y-4">
                    {offeringBankName && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground font-medium">은행</span>
                        <span className="text-foreground text-lg font-semibold">
                          {offeringBankName}
                        </span>
                      </div>
                    )}

                    {offeringAccountNumber && (
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground font-medium">계좌번호</span>
                        <span className="text-foreground text-lg font-mono font-semibold">
                          {offeringAccountNumber}
                        </span>
                      </div>
                    )}

                    {offeringAccountHolder && (
                      <div className="flex items-center justify-between py-3">
                        <span className="text-muted-foreground font-medium">예금주</span>
                        <span className="text-foreground text-lg font-semibold">
                          {offeringAccountHolder}
                        </span>
                      </div>
                    )}
                  </div>

                  {offeringAccountNumber && (
                    <CopyAccountButton accountNumber={offeringAccountNumber} />
                  )}
                </div>
              </section>
            )}

            {/* KakaoPay QR */}
            {kakaoPayQrImage && (
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-6">카카오페이</h2>
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground mb-6">
                    아래 QR 코드를 카카오톡에서 스캔하여 송금할 수 있습니다
                  </p>
                  <div className="inline-block bg-white p-4 rounded-lg shadow-md">
                    <Image
                      src={kakaoPayQrImage.url || ''}
                      alt="카카오페이 QR 코드"
                      width={kakaoPayQrImage.width || 300}
                      height={kakaoPayQrImage.height || 300}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Notes */}
            {offeringNotes && (
              <section className="mb-12">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span>💡</span>
                    <span>안내 사항</span>
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-line">{offeringNotes}</p>
                </div>
              </section>
            )}
          </>
        )}

        {/* Bible Verse */}
        <section className="bg-card border border-border rounded-lg p-8 text-center">
          <blockquote className="text-lg italic text-muted-foreground mb-4">
            "각각 그 마음에 정한 대로 할 것이요 인색함으로나 억지로 하지 말지니
            <br />
            하나님은 즐겨 내는 자를 사랑하시느니라"
          </blockquote>
          <cite className="text-sm text-primary font-semibold">고린도후서 9:7</cite>
        </section>
      </div>
    </main>
  )
}
