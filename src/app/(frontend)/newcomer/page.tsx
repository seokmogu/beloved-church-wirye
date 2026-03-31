import type { Metadata } from 'next'
import { NewcomerForm } from './NewcomerForm'

export const metadata: Metadata = {
  title: '새가족 등록 | 사랑하는교회',
  description: '사랑하는교회에 오신 것을 환영합니다. 새가족 등록을 통해 교회와 소통할 수 있습니다.',
}

export default function NewcomerPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#1B3A2D] py-16">
        <div className="container text-center">
          <p className="text-[#C9A84C] text-sm font-medium tracking-wider uppercase mb-2">
            WELCOME
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">새가족 등록</h1>
          <p className="text-white/80 mt-3 text-base max-w-2xl mx-auto leading-relaxed">
            사랑하는교회에 오신 것을 환영합니다!
            <br />
            간단한 정보를 남겨주시면 새가족 담당자가 연락드리겠습니다.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container py-12 max-w-2xl">
        <NewcomerForm />
      </div>

      {/* Info Section */}
      <div className="container max-w-2xl pb-16">
        <div className="bg-muted/30 border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">📍 처음 오시는 분들께</h2>
          <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>• <strong>예배 시간:</strong> 주일 낮 12:00, 금요 저녁 8:00</li>
            <li>• <strong>주차:</strong> 인근 공영주차장을 이용해 주세요</li>
            <li>• <strong>복장:</strong> 편안한 옷차림으로 오세요</li>
            <li>• <strong>어린이:</strong> 가족실과 어린이 프로그램이 준비되어 있습니다</li>
            <li>• <strong>안내:</strong> 처음 방문하시는 분은 안내 데스크를 찾아주세요</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
