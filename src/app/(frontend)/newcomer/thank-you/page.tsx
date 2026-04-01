import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '등록 완료 | 사랑하는교회',
  description: '새가족 등록이 완료되었습니다.',
}

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 성공 아이콘 */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* 메시지 */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          등록이 완료되었습니다
        </h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          사랑하는교회에 관심을 가져주셔서 감사합니다.
          <br />
          담당자가 곧 연락드려 교회를 따뜻하게 안내해 드리겠습니다.
        </p>

        {/* 안내 카드 */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            예배 안내
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-secondary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">주일 예배:</strong> 매주 일요일 오후 12시
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">금요 예배:</strong> 매주 금요일 오후 8시
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary mt-0.5">•</span>
              <span>
                <strong className="text-foreground">위치:</strong> 서울 송파구 위례성대로 6길
                19 2층
              </span>
            </li>
          </ul>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 bg-primary text-white font-medium py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors text-center"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/worship"
            className="flex-1 bg-white border-2 border-primary text-primary font-medium py-3 px-6 rounded-lg hover:bg-primary/5 transition-colors text-center"
          >
            예배 안내 보기
          </Link>
        </div>
      </div>
    </main>
  )
}
