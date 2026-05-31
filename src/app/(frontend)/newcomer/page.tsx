import type { Metadata } from 'next'
import { NewcomerForm } from './NewcomerForm'

export const metadata: Metadata = {
  title: '새가족등록 | 사랑하는교회',
  description: '사랑하는교회에 오신 것을 환영합니다. 새가족등록을 통해 교회와 함께하세요.',
}

export default function NewcomerPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary py-16">
        <div className="container text-center">
          <p className="text-secondary text-sm font-medium tracking-wider uppercase mb-2">
            WELCOME
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">새가족등록</h1>
          <p className="text-white/60 mt-2 max-w-2xl mx-auto">
            WELCOME! 사랑하는교회에 오신 당신을 환영합니다.
            <br />
            등록카드 내용을 남겨주시면 목양 사역 안에서 따뜻하게 안내하겠습니다.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <NewcomerForm />
        </div>
      </div>
    </main>
  )
}
