'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

// Church coordinates (approximate for Wirye)
const CHURCH_LAT = 37.4697
const CHURCH_LNG = 127.1489

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void
        LatLng: new (lat: number, lng: number) => unknown
        Map: new (container: HTMLElement, options: Record<string, unknown>) => unknown
        Marker: new (options: Record<string, unknown>) => unknown
        InfoWindow: new (options: Record<string, unknown>) => {
          open: (map: unknown, marker: unknown) => void
        }
      }
    }
  }
}

export function KakaoMapSection() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY

  function initMap() {
    if (!mapRef.current || !window.kakao?.maps) return
    if (mapInstanceRef.current) return

    window.kakao.maps.load(() => {
      const position = new window.kakao.maps.LatLng(CHURCH_LAT, CHURCH_LNG)
      const map = new window.kakao.maps.Map(mapRef.current!, {
        center: position,
        level: 3,
      })
      mapInstanceRef.current = map

      const marker = new window.kakao.maps.Marker({ map, position })

      const infoWindow = new window.kakao.maps.InfoWindow({
        content:
          '<div style="padding:8px 12px;font-size:13px;font-weight:600;white-space:nowrap;">사랑하는교회</div>',
      })
      infoWindow.open(map, marker)
    })
  }

  useEffect(() => {
    // If the script has already been loaded on a previous render
    if (window.kakao?.maps) {
      initMap()
    }
  }, [])

  if (!kakaoKey) {
    return (
      <section id="map" className="py-20 bg-secondary/30">
        <div className="container text-center text-muted-foreground">
          <p>Kakao Map key is not configured.</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false`}
        strategy="afterInteractive"
        onLoad={initMap}
      />

      <section id="map" className="py-20 bg-secondary/30">
        <div className="container">
          {/* Section header */}
          <div className="mb-10">
            <p className="text-[#C9A84C] text-sm font-medium tracking-wider uppercase mb-2">
              Location
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">찾아오는 길</h2>
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
                    className="w-5 h-5 text-[#C9A84C]"
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
                  위례서일로 3길 21-4
                  <br />
                  (BELOVED LOUNGE)
                </p>
              </div>

              {/* Transit */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#C9A84C]"
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
                <p className="text-muted-foreground leading-relaxed">
                  남위례역 근처
                  <br />
                  도보 약 5분 거리
                </p>
              </div>

              {/* Worship schedule */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#C9A84C]"
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
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-foreground font-medium">주일예배</span>
                    <span className="text-[#C9A84C] font-semibold">12:00</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-foreground font-medium">저녁예배</span>
                    <span className="text-[#C9A84C] font-semibold">20:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
