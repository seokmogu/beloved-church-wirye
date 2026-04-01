import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = {
  title: '교회 소개 | 사랑하는교회',
  description: '사랑하는교회 위례는 그리스도를 본받아 함께 사랑하는 공동체입니다.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label="ABOUT US"
        title="교회 소개"
        subtitle="그리스도를 본받아 함께 사랑하는 공동체"
      />

      <div className="container py-16 max-w-4xl">
        {/* Vision */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            비전: Like Christ (그리스도를 본받아)
          </h2>
          <div className="prose prose-lg text-muted-foreground">
            <p>
              사랑하는교회는 예수 그리스도의 삶과 사랑을 본받아, 하나님과 이웃을 사랑하는 공동체입니다.
            </p>
            <p>
              우리는 말씀 중심의 예배와 기도, 그리고 성도 간의 교제를 통해 그리스도의 형상을 닮아가며,
              위례 신도시에서 복음의 빛을 비추는 교회가 되기를 소망합니다.
            </p>
          </div>
        </section>

        {/* Church Info */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">교회 소개</h2>
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">교단</h3>
              <p className="text-muted-foreground">기독교대한감리회</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">위치</h3>
              <p className="text-muted-foreground">
                경기도 성남시 수정구 위례서일로 3길 21-4 (BELOVED LOUNGE)
                <br />
                남위례역 근처
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">예배 시간</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">주일예배:</strong> 매주 일요일 오후 12:00</p>
                <p><strong className="text-foreground">금요기도회:</strong> 매주 금요일 저녁 8:00</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">핵심 가치</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">📖</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">말씀 중심</h3>
              <p className="text-sm text-muted-foreground">
                성경 말씀을 삶의 기준으로 삼아 신앙과 삶을 일치시킵니다
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">🙏</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">예배와 기도</h3>
              <p className="text-sm text-muted-foreground">
                하나님께 영광 돌리는 예배와 간절한 기도로 신앙을 성장시킵니다
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="text-4xl mb-3">❤️</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">사랑과 섬김</h3>
              <p className="text-sm text-muted-foreground">
                그리스도의 사랑으로 서로를 섬기고 이웃에게 복음을 전합니다
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            사랑하는교회와 함께하세요
          </h2>
          <p className="text-muted-foreground mb-6">
            처음 오시는 분들을 환영합니다. 언제든 방문하셔서 함께 예배하고 교제하실 수 있습니다.
          </p>
          <a
            href="/newcomer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            새가족 등록하기
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </section>
      </div>
    </main>
  )
}
