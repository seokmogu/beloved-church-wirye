export function ChurchIntroSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#C9A84C] text-sm font-medium tracking-wider uppercase mb-3">
              ABOUT US
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
              그리스도를 본받아<br />함께 사랑하는 공동체
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                사랑하는교회는 기독교대한감리회 소속으로, 위례 신도시에서 하나님의 말씀을 중심으로 모이는 공동체입니다.
              </p>
              <p>
                우리는 <strong className="text-foreground">Like Christ (그리스도를 본받아)</strong>라는 비전 아래, 예수님의 삶과 사랑을 삶 속에서 실천하는 교회를 지향합니다.
              </p>
              <p>
                주일예배와 금요기도회를 통해 말씀을 나누며, 소그룹과 다양한 사역으로 서로 연결된 공동체를 만들어가고 있습니다.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-[#1B3A2D]" />
                <span className="text-foreground font-medium">기독교대한감리회</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
                <span className="text-foreground font-medium">위례 신도시</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-[#1B3A2D]" />
                <span className="text-foreground font-medium">Like Christ</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#1B3A2D] rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold text-[#C9A84C] mb-1">예배</div>
              <div className="text-sm text-white/70 mb-3">Worship</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">주일예배</span>
                  <span className="font-semibold">12:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">금요기도회</span>
                  <span className="font-semibold">20:00</span>
                </div>
              </div>
            </div>
            <div className="bg-[#F5F0E8] rounded-2xl p-6">
              <div className="text-3xl font-bold text-[#1B3A2D] mb-1">위치</div>
              <div className="text-sm text-[#1B3A2D]/60 mb-3">Location</div>
              <div className="text-sm text-[#1B3A2D]/80 leading-relaxed">
                위례서일로 3길 21-4<br />
                (BELOVED LOUNGE)<br />
                남위례역 근처
              </div>
            </div>
            <div className="col-span-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-6">
              <p className="text-[#1B3A2D] font-medium text-sm leading-relaxed text-center">
                &ldquo;사랑 안에서 진리를 말하고, 그리스도 안에서 함께 자라가는 교회&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
