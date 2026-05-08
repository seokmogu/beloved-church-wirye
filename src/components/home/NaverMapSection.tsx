'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (container: HTMLElement, options: Record<string, unknown>) => unknown
        LatLng: new (lat: number, lng: number) => unknown
        Marker: new (options: Record<string, unknown>) => unknown
        InfoWindow: new (options: Record<string, unknown>) => {
          open: (map: unknown, marker: unknown) => void
        }
      }
    }
  }
}

type NaverMapSectionProps = {
  address?: string
  addressDetail?: string
  churchName?: string
  description?: string | null
  eyebrow?: string | null
  transitInfo?: string
  title?: string | null
  worshipServices?: {
    name?: string | null
    time?: string | null
  }[] | null
  lat?: number
  lng?: number
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function NaverMapSection({
  address = '위례서일로 3길 21-4',
  addressDetail = 'BELOVED LOUNGE',
  churchName = '사랑하는교회',
  description,
  eyebrow,
  transitInfo = '남위례역 근처, 도보 약 5분 거리',
  title,
  worshipServices,
  lat = 37.4670,
  lng = 127.1395,
}: NaverMapSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  const naverClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID

  function initMap() {
    if (!mapRef.current || !window.naver?.maps) return
    if (mapInstanceRef.current) return

    const position = new window.naver.maps.LatLng(lat, lng)
    const map = new window.naver.maps.Map(mapRef.current, {
      center: position,
      zoom: 16,
    })
    mapInstanceRef.current = map

    const marker = new window.naver.maps.Marker({ map, position })

    const infoWindow = new window.naver.maps.InfoWindow({
      content:
        `<div style="padding:8px 12px;font-size:13px;font-weight:600;white-space:nowrap;">${escapeHtml(churchName)}</div>`,
    })
    infoWindow.open(map, marker)
  }

  useEffect(() => {
    if (window.naver?.maps) {
      initMap()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!naverClientId) {
    return (
      <section id="map" className="church-section-surface py-20 md:py-24">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase text-secondary">{eyebrow ?? 'Location'}</p>
              <h2 className="text-3xl font-bold text-foreground md:text-5xl">{title ?? '오시는 길'}</h2>
              {description && <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">{description}</p>}
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-[0_18px_60px_rgba(20,42,33,0.08)]">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">주소</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {address}
                    {addressDetail && (
                      <>
                        <br />({addressDetail})
                      </>
                    )}
                  </p>
                  <a
                    href={`https://map.naver.com/p/search/${encodeURIComponent(`${churchName} ${address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
                  >
                    네이버 지도 열기
                  </a>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground">예배 시간</h3>
                  <div className="mt-3 divide-y divide-border text-sm">
                    {(worshipServices ?? []).filter((item) => item?.name && item?.time).slice(0, 4).map((item) => (
                      <div key={`${item.name}-${item.time}`} className="grid grid-cols-[1fr_auto] gap-4 py-2.5 first:pt-0">
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="font-semibold text-primary">{item.time}</span>
                      </div>
                    ))}
                  </div>
                  {transitInfo && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{transitInfo}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <Script
        src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naverClientId}`}
        strategy="afterInteractive"
        onLoad={initMap}
      />

      <section id="map" className="church-section-surface py-20 md:py-24">
        <div className="container">
          <div className="mb-10">
            <p className="mb-2 text-sm font-semibold uppercase text-secondary">{eyebrow ?? 'Location'}</p>
            <h2 className="text-3xl font-bold text-foreground md:text-5xl">{title ?? '오시는 길'}</h2>
            {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div
                ref={mapRef}
                className="h-[400px] w-full overflow-hidden rounded-lg border border-border shadow-[0_18px_60px_rgba(20,42,33,0.08)]"
                aria-label="Church location map"
              />
            </div>

            <div className="flex flex-col gap-8 rounded-lg border border-border bg-card p-6 lg:col-span-2">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <svg
                    className="h-5 w-5 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  주소
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {address}
                  {addressDetail && (
                    <>
                      <br />({addressDetail})
                    </>
                  )}
                </p>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <svg
                    className="h-5 w-5 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  교통편
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {transitInfo.split('\n').map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <svg
                    className="h-5 w-5 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  예배 시간
                </h3>
                <div className="space-y-1.5 text-sm">
                  {(worshipServices ?? []).filter((item) => item?.name && item?.time).map((item) => (
                    <div key={`${item.name}-${item.time}`} className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="font-semibold text-primary">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
