import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { CopyAccountButton } from '@/components/CopyAccountButton'

export const metadata: Metadata = {
  title: '헌금 안내 | 사랑하는교회',
  description: '사랑하는교회 위례 헌금 안내 - 은행 계좌 및 카카오페이 송금 방법',
}

export default function OfferingPage() {
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

        {/* Bank Account */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">계좌 이체</h2>
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground font-medium">은행</span>
                <span className="text-foreground text-lg font-semibold">국민은행</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground font-medium">계좌번호</span>
                <span className="text-foreground text-lg font-mono font-semibold">
                  123-456-7890
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground font-medium">예금주</span>
                <span className="text-foreground text-lg font-semibold">사랑하는교회</span>
              </div>
            </div>

            <CopyAccountButton accountNumber="123-456-7890" />
          </div>
        </section>

        {/* Notes */}
        <section className="mb-12">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>안내 사항</span>
            </h3>
            <p className="text-muted-foreground whitespace-pre-line">
              - 헌금은 예배 시간에 직접 드리거나 계좌 이체로 가능합니다.
              {'\n'}- 입금 시 이름을 명시해 주시면 감사하겠습니다.
              {'\n'}- 문의사항은 교회 사무실로 연락 주시기 바랍니다.
            </p>
          </div>
        </section>

        {/* Bible Verse */}
        <section className="bg-card border border-border rounded-lg p-8 text-center">
          <blockquote className="text-lg italic text-muted-foreground mb-4">
            "각각 그 마음에 정한 대로 할 것이요 인색함으로나 억지로 하지 말지니
            <br />
            하나님은 즐겨 내는 자를 사랑하시느니라"
          </blockquote>
          <cite className="text-sm text-primary font-semibold">고린도후서 9:7</cite>
        </section>

        {/* Additional Info */}
        <section className="mt-12 text-center">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center justify-center gap-2">
              <span>💳</span>
              <span>헌금의 종류</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">십일조</h4>
                <p className="text-sm text-muted-foreground">
                  소득의 십분의 일을 하나님께 드리는 헌금
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">주정헌금</h4>
                <p className="text-sm text-muted-foreground">주일예배 시 정기적으로 드리는 헌금</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">감사헌금</h4>
                <p className="text-sm text-muted-foreground">
                  하나님의 은혜에 감사하며 드리는 헌금
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
