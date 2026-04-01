'use client'

/**
 * 임시 하드코딩 부활절 배너
 * 2026-04-05 이후 자동으로 숨겨짐
 * TODO: 추후 CMS 기반 배너 시스템으로 교체 필요
 */
export default function EasterBanner() {
  // 현재 날짜 확인 (클라이언트 사이드)
  const today = new Date()
  const easterDate = new Date('2026-04-05T23:59:59+09:00') // 한국 시간 기준

  // 부활절 지나면 숨김
  if (today > easterDate) {
    return null
  }

  return (
    <div className="bg-[#1B3A2D] text-white py-3 px-4 text-center">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
        <span className="font-bold text-base sm:text-lg">🌟 부활절 특별예배</span>
        <span className="text-sm sm:text-base text-gray-200">4월 5일 (토) 오전 10:30</span>
      </div>
    </div>
  )
}
