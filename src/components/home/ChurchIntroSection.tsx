import configPromise from '@payload-config'
import { getPayload } from 'payload'

async function getSiteSettings() {
  try {
    const payload = await getPayload({ config: configPromise })
    return await payload.findGlobal({ slug: 'site-settings' })
  } catch {
    return null
  }
}

export async function ChurchIntroSection() {
  const settings = await getSiteSettings()

  const sundayTime = settings?.sundayServiceTime ?? '12:00'
  const fridayTime = settings?.fridayServiceTime ?? '20:00'
  const address = settings?.address ?? '위례서일로 3길 21-4'
  const addressDetail = settings?.addressDetail ?? 'BELOVED LOUNGE'
  const description = settings?.churchDescription ??
    '사랑하는교회는 기독교대한감리회 소속으로, 위례 신도시에서 하나님의 말씀을 중심으로 모이는 공동체입니다.'
  const vision = settings?.churchVision ?? 'Like Christ (그리스도를 본받아)'
  const quote = settings?.churchQuote ?? '사랑 안에서 진리를 말하고, 그리스도 안에서 함께 자라가는 교회'
  const denomination = settings?.denomination ?? '기독교대한감리회'

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-secondary text-sm font-medium tracking-wider uppercase mb-3">
              ABOUT US
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
              그리스도를 본받아<br />함께 사랑하는 공동체
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{description}</p>
              <p>
                우리는 <strong className="text-foreground">{vision}</strong>이라는 비전 아래,
                예수님의 삶과 사랑을 삶 속에서 실천하는 교회를 지향합니다.
              </p>
              <p>
                주일예배와 금요기도회를 통해 말씀을 나누며, 소그룹과 다양한 사역으로 서로 연결된 공동체를 만들어가고 있습니다.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-foreground font-medium">{denomination}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-foreground font-medium">위례 신도시</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-foreground font-medium">Like Christ</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-primary rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold text-secondary mb-1">예배</div>
              <div className="text-sm text-white/70 mb-3">Worship</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">주일예배</span>
                  <span className="font-semibold">{sundayTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">금요기도회</span>
                  <span className="font-semibold">{fridayTime}</span>
                </div>
              </div>
            </div>
            <div className="bg-neutral-cream rounded-2xl p-6">
              <div className="text-3xl font-bold text-primary mb-1">위치</div>
              <div className="text-sm text-primary/60 mb-3">Location</div>
              <div className="text-sm text-primary/80 leading-relaxed">
                {address}<br />
                ({addressDetail})<br />
                남위례역 근처
              </div>
            </div>
            <div className="col-span-2 bg-secondary/10 border border-secondary/30 rounded-2xl p-6">
              <p className="text-primary font-medium text-sm leading-relaxed text-center">
                &ldquo;{quote}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
