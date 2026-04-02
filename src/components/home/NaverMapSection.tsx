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
  transitInfo?: string
  sundayServiceTime?: string
  fridayServiceTime?: string
  lat?: number
  lng?: number
}

export function NaverMapSection({
  address = '위례서일로 3길 21-4',
  addressDetail = 'BELOVED LOUNGE',
  transitInfo = '남위례역 근처, 도보 약 5분 거리',
  sundayServiceTime = '12:00',
  fridayServiceTime = '20:00',
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
        '<div style="padding:8px 12px;font-size:13px;font-weight:600;white-space:nowrap;">사랑하는교회</div>',
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
      <section id="map" className="py-20 bg-secondary/30">
        <div className="container text-center text-muted-foreground">
          <p>Naver Map client ID is not configured.</p>
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

      <section id="map" className="py-20 bg-secondary/30">
        <div className="container">
          {/* Section header */}
          <div className="mb-10">
            <p className="text-secondary text-sm font-medium tracking-wider uppercase mb-2">
              Location
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">오시는 길</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Map */}
            <div className="lg:col-span-3">
              <div
                ref={mapRef}
                className="w-full h-[400px] rounded-xl overflow-hidden border border-border"
                aria-label="Church location map"
              />
            </div>

            {/* Info */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-secondary"
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
                <p className="text-muted-foreground leading-relaxed">
                  {address}
                  {addressDetail && (
                    <>
                      <br />({addressDetail})
                    </>
                  )}
                </p>
              </div>

              {/* Transit */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-secondary"
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
                <div className="text-muted-foreground text-sm space-y-1">
                  <p><span className="font-medium text-foreground">자차 이용 시</span> — 네이버에서 &apos;비러브드라운지&apos; 검색</p>
                  <p><span className="font-medium text-foreground">대중교통 이용 시</span> — 남위례역 3번 출구 도보 5분</p>
                </div>
              </div>

              {/* Worship schedule */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-secondary"
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
                  {[
                    { label: '청·장년예배', time: '주일 낮 12시' },
                    { label: '어린이예배', time: '주일 낮 12시' },
                    { label: '금요기도회', time: '금요일 밤 8시' },
                    { label: '매일 큐티', time: '월–금 새벽 6시 (온라인)' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                      <span className="text-foreground font-medium">{item.label}</span>
                      <span className="text-secondary font-semibold">{item.time}</span>
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
