import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = {
  title: '예배 안내 | 사랑하는교회',
  description:
    '사랑하는교회 위례의 주일예배와 금요기도회 안내입니다. 함께 하나님께 예배드리고 교제하세요.',
}

export default function WorshipPage() {
  return (
    <main className="min-h-screen bg-background">
      <PageHero label="WORSHIP" title="예배 안내" subtitle="하나님께 영광 돌리는 예배" />

      <div className="container py-16 max-w-4xl">
        {/* Worship Schedule */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">예배 시간</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">☀️</div>
                <h3 className="text-2xl font-bold text-foreground">주일예배</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-2">
                매주 일요일 <strong className="text-foreground">오후 12:00</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                말씀과 찬양으로 하나님께 영광을 돌리며, 한 주를 시작합니다.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">🌙</div>
                <h3 className="text-2xl font-bold text-foreground">금요기도회</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-2">
                매주 금요일 <strong className="text-foreground">저녁 8:00</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                함께 모여 기도하며 하나님의 임재를 경험합니다.
              </p>
            </div>
          </div>
        </section>

        {/* Worship Order */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">예배 순서</h2>
          <div className="bg-card border border-border rounded-lg p-8">
            <ol className="space-y-4">
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                  1
                </span>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">예배 준비 및 묵상</h4>
                  <p className="text-sm text-muted-foreground">마음을 준비하며 하나님을 기다립니다</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                  2
                </span>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">찬양</h4>
                  <p className="text-sm text-muted-foreground">
                    찬양으로 하나님을 경배하고 영광을 돌립니다
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                  3
                </span>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">기도</h4>
                  <p className="text-sm text-muted-foreground">공동체의 기도 제목을 함께 나눕니다</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                  4
                </span>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">말씀</h4>
                  <p className="text-sm text-muted-foreground">성경 말씀을 듣고 묵상합니다</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                  5
                </span>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">헌금</h4>
                  <p className="text-sm text-muted-foreground">감사함으로 하나님께 드립니다</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
                  6
                </span>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">축도</h4>
                  <p className="text-sm text-muted-foreground">하나님의 축복을 받으며 마칩니다</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Location & Access */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">찾아오시는 길</h2>
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>📍</span>
                주소
              </h3>
              <p className="text-muted-foreground">
                경기도 성남시 수정구 위례서일로 3길 21-4 (BELOVED LOUNGE)
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>🚇</span>
                교통편
              </h3>
              <p className="text-muted-foreground">
                <strong>남위례역</strong> 근처, 도보 약 5분 거리
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>🅿️</span>
                주차 안내
              </h3>
              <p className="text-muted-foreground">주변 공영주차장을 이용하실 수 있습니다.</p>
            </div>
          </div>
        </section>

        {/* Online Worship */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">온라인 예배</h2>
          <div className="bg-card border border-border rounded-lg p-8">
            <p className="text-muted-foreground mb-6">
              현장에 참석하기 어려운 분들을 위해 YouTube를 통해 실시간으로 예배를 생중계합니다.
            </p>
            <a
              href="https://www.youtube.com/@BelovedChurchWirye"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#FF0000] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#CC0000] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube 채널 바로가기
            </a>
          </div>
        </section>

        {/* First-timers */}
        <section className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">처음 오시는 분들께</h2>
          <p className="text-muted-foreground mb-6">
            사랑하는교회는 누구나 환영합니다. 편안한 마음으로 예배에 참석하시고, 함께 교제하며
            하나님의 사랑을 경험하세요.
            <br />
            예배 후에는 다과를 나누며 서로 인사하는 시간이 있습니다.
          </p>
          <a
            href="/newcomer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            새가족 등록하기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </section>
      </div>
    </main>
  )
}
