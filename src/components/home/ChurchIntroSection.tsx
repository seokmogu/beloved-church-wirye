import type { SiteSetting } from '@/payload-types'

type HomeSectionCopy = {
  description?: string | null
  eyebrow?: string | null
  title?: string | null
}

export function ChurchIntroSection({
  section,
  settings,
}: {
  section?: HomeSectionCopy
  settings?: SiteSetting | null
}) {
  const services = (settings?.worshipServices ?? []).filter((item) => item?.name && item?.time)
  const values = (settings?.coreValues ?? []).filter((item) => item?.title && item?.description)
  const address = settings?.address ?? ''
  const addressDetail = settings?.addressDetail ?? ''
  const description = section?.description ?? settings?.churchDescription ?? ''
  const vision = settings?.churchVision ?? ''
  const quote = settings?.churchQuote ?? ''
  const denomination = settings?.denomination ?? ''

  return (
    <section className="church-section-surface border-b border-border py-20 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="mb-3 text-sm font-semibold uppercase text-secondary">
              {section?.eyebrow ?? 'ABOUT US'}
            </p>
            <h2 className="church-section-heading max-w-xl font-bold leading-tight text-foreground">
              {section?.title ?? settings?.tagline ?? '교회 소개'}
            </h2>
            <div className="church-body-copy mt-6 max-w-xl space-y-4 leading-relaxed text-muted-foreground">
              {description && <p>{description}</p>}
              {vision && (
                <p>
                  우리는 <strong className="text-foreground">{vision}</strong>이라는 비전 아래,
                  예수님의 삶과 사랑을 삶 속에서 실천하는 교회를 지향합니다.
                </p>
              )}
            </div>

            <dl className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {denomination && (
                <div className="border-l-2 border-secondary pl-4">
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">교단</dt>
                  <dd className="mt-1 font-semibold text-foreground">{denomination}</dd>
                </div>
              )}
              {(address || addressDetail) && (
                <div className="border-l-2 border-secondary pl-4">
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">위치</dt>
                  <dd className="mt-1 font-semibold text-foreground">{address}</dd>
                  {addressDetail && <dd className="text-sm text-muted-foreground">{addressDetail}</dd>}
                </div>
              )}
            </dl>
          </div>

          <div className="space-y-6">
            {services.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6 shadow-[0_18px_60px_rgba(20,42,33,0.08)]">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-foreground">예배와 모임</h3>
                  <span className="text-xs font-semibold uppercase text-secondary">Worship</span>
                </div>
                <div className="divide-y divide-border">
                  {services.slice(0, 4).map((item) => (
                    <div key={`${item.name}-${item.time}`} className="grid grid-cols-[1fr_auto] gap-4 py-4 first:pt-0 last:pb-0">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-sm font-semibold text-primary">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {quote && (
              <div className="rounded-lg border border-secondary/35 bg-secondary/10 px-6 py-6">
                <p className="text-center text-base font-semibold leading-relaxed text-primary">&ldquo;{quote}&rdquo;</p>
              </div>
            )}

            {values.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-3">
                {values.slice(0, 3).map((item, index) => (
                  <div key={item.title} className="rounded-lg border border-border bg-card p-5 transition-transform duration-300 hover:-translate-y-1">
                    <span className="text-xs font-bold text-secondary">{String(index + 1).padStart(2, '0')}</span>
                    <h4 className="mt-3 font-semibold text-foreground">{item.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
