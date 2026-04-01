import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '교회 소개 | 사랑하는교회',
  description: '사랑하는교회 위례는 그리스도를 본받아 함께 사랑하는 공동체입니다.',
}

const sections = [
  { id: 'intro', label: '① 교회 소개' },
  { id: 'pastor', label: '② 담임목사 소개' },
  { id: 'worship', label: '③ 예배 안내' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label="ABOUT US"
        title="교회 소개"
        subtitle="그리스도를 본받아 함께 사랑하는 공동체"
      />

      {/* 섹션 내비게이션 */}
      <div className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
        <div className="container">
          <nav className="flex overflow-x-auto">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 px-6 py-4 text-sm font-medium text-muted-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* ① 교회 소개 */}
      <section id="intro" className="py-20 bg-background scroll-mt-16">
        <div className="container max-w-4xl">
          <div className="mb-2 text-sm font-medium text-secondary tracking-wider uppercase">
            Church Introduction
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
            교회 소개
          </h2>

          {/* 비전 */}
          <div className="bg-primary text-white rounded-2xl p-8 mb-10">
            <p className="text-secondary text-sm font-medium tracking-wider uppercase mb-2">Vision</p>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Like Christ<br />
              <span className="text-white/80 text-xl font-medium">그리스도를 본받아</span>
            </h3>
            <p className="text-white/80 leading-relaxed">
              사랑하는교회는 예수 그리스도의 삶과 사랑을 본받아, 하나님과 이웃을 사랑하는 공동체입니다.
              말씀 중심의 예배와 기도, 성도 간의 교제를 통해 그리스도의 형상을 닮아가며
              위례 신도시에서 복음의 빛을 비추는 교회가 되기를 소망합니다.
            </p>
          </div>

          {/* 교단·위치 */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="border border-border rounded-xl p-6">
              <p className="text-xs text-secondary font-semibold tracking-widest uppercase mb-1">교단</p>
              <p className="text-lg font-semibold text-foreground">기독교대한감리회</p>
            </div>
            <div className="border border-border rounded-xl p-6">
              <p className="text-xs text-secondary font-semibold tracking-widest uppercase mb-1">위치</p>
              <p className="text-lg font-semibold text-foreground">위례서일로 3길 21-4</p>
              <p className="text-sm text-muted-foreground">BELOVED LOUNGE · 남위례역 근처</p>
            </div>
          </div>

          {/* 핵심 가치 */}
          <h3 className="text-xl font-bold text-foreground mb-6">핵심 가치</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📖', title: '말씀 중심', desc: '성경 말씀을 삶의 기준으로 삼아 신앙과 삶을 일치시킵니다' },
              { icon: '🙏', title: '예배와 기도', desc: '하나님께 영광 돌리는 예배와 간절한 기도로 신앙을 성장시킵니다' },
              { icon: '❤️', title: '사랑과 섬김', desc: '그리스도의 사랑으로 서로를 섬기고 이웃에게 복음을 전합니다' },
            ].map((v) => (
              <div key={v.title} className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{v.title}</h4>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 구분선 */}
      <div className="h-px bg-border" />

      {/* ② 담임목사 소개 */}
      <section id="pastor" className="py-20 bg-neutral-cream/40 scroll-mt-16">
        <div className="container max-w-4xl">
          <div className="mb-2 text-sm font-medium text-secondary tracking-wider uppercase">
            Senior Pastor
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
            담임목사 소개
          </h2>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* 사진 자리 (이미지 전달 후 교체) */}
            <div className="shrink-0">
              <div className="w-48 h-48 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                <span className="text-5xl">👨‍💼</span>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-1">차원석 목사</h3>
              <p className="text-secondary font-medium mb-6">사랑하는교회 담임목사</p>

              <div className="space-y-3 text-muted-foreground leading-relaxed mb-6">
                <p>연세대학교 일반대학원 박사과정(Ph.D) 재학</p>
                <p>감리교신학대학교 및 대학원(Th.M) 졸업</p>
                <p>前 만나교회 부목사</p>
              </div>

              <blockquote className="border-l-4 border-secondary pl-4 italic text-muted-foreground">
                "우리는 사랑으로 교회를 세웁니다."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* 구분선 */}
      <div className="h-px bg-border" />

      {/* ③ 예배 안내 */}
      <section id="worship" className="py-20 bg-background scroll-mt-16">
        <div className="container max-w-4xl">
          <div className="mb-2 text-sm font-medium text-secondary tracking-wider uppercase">
            Worship Guide
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
            예배 안내
          </h2>

          {/* 예배 시간 */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-primary text-white rounded-2xl p-8">
              <p className="text-secondary text-sm font-medium tracking-widest uppercase mb-3">Sunday Service</p>
              <h3 className="text-2xl font-bold mb-1">주일예배</h3>
              <p className="text-4xl font-bold text-secondary mb-3">12:00</p>
              <p className="text-white/70 text-sm">매주 일요일 낮 12시</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8">
              <p className="text-secondary text-sm font-medium tracking-widest uppercase mb-3">Friday Prayer</p>
              <h3 className="text-2xl font-bold text-foreground mb-1">금요기도회</h3>
              <p className="text-4xl font-bold text-primary mb-3">20:00</p>
              <p className="text-muted-foreground text-sm">매주 금요일 저녁 8시</p>
            </div>
          </div>

          {/* 위치 안내 */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-10">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span>📍</span> 찾아오는 길
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-secondary tracking-widest uppercase mb-1">주소</p>
                <p className="text-foreground font-medium">위례서일로 3길 21-4</p>
                <p className="text-muted-foreground text-sm">BELOVED LOUNGE</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-secondary tracking-widest uppercase mb-1">교통편</p>
                <p className="text-foreground font-medium">남위례역</p>
                <p className="text-muted-foreground text-sm">도보 약 5분 거리</p>
              </div>
            </div>
          </div>

          {/* 안내 사항 */}
          <div className="bg-neutral-cream/60 border border-secondary/20 rounded-2xl p-8 mb-10">
            <h3 className="text-lg font-bold text-foreground mb-4">처음 오시는 분들께</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• 주차는 인근 공영주차장을 이용해 주세요.</li>
              <li>• 어린이를 위한 별도 프로그램이 준비되어 있습니다.</li>
              <li>• 복장은 편하게 오시면 됩니다.</li>
              <li>• 처음 방문하시는 분은 안내 데스크를 찾아주세요.</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/newcomer"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-lg"
            >
              새가족 등록하기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
