'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FormData = {
  name: string
  phone: string
  email: string
  visitDate: string
  source: string
  sourceDetail: string
  interests: string[]
  message: string
  privacyConsent: boolean
}

const initialFormData: FormData = {
  name: '',
  phone: '',
  email: '',
  visitDate: new Date().toISOString().split('T')[0],
  source: 'referral',
  sourceDetail: '',
  interests: [],
  message: '',
  privacyConsent: false,
}

export function NewcomerForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      if (name === 'privacyConsent') {
        setFormData((prev) => ({ ...prev, [name]: checked }))
      } else {
        // interests 다중 선택
        setFormData((prev) => ({
          ...prev,
          interests: checked
            ? [...prev.interests, value]
            : prev.interests.filter((v) => v !== value),
        }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.privacyConsent) {
      setError('개인정보 수집 및 이용에 동의해 주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newcomers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '등록에 실패했습니다.')
      }

      // 성공 시 감사 페이지로 이동
      router.push('/newcomer/thank-you')
    } catch (err) {
      console.error('Form submission error:', err)
      setError(err instanceof Error ? err.message : '등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
      {/* 이름 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
          placeholder="홍길동"
        />
      </div>

      {/* 연락처 */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
          연락처 <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
          placeholder="010-1234-5678"
        />
      </div>

      {/* 이메일 */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          이메일
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
          placeholder="example@email.com"
        />
      </div>

      {/* 방문 예정일 */}
      <div>
        <label htmlFor="visitDate" className="block text-sm font-medium text-foreground mb-2">
          방문 예정일 또는 첫 방문일 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="visitDate"
          name="visitDate"
          required
          value={formData.visitDate}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
        />
        <p className="text-xs text-muted-foreground mt-1">
          주일 예배 또는 금요 예배일을 선택해 주세요
        </p>
      </div>

      {/* 교회를 알게 된 경로 */}
      <div>
        <label htmlFor="source" className="block text-sm font-medium text-foreground mb-2">
          교회를 알게 된 경로 <span className="text-red-500">*</span>
        </label>
        <select
          id="source"
          name="source"
          required
          value={formData.source}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
        >
          <option value="referral">지인 소개</option>
          <option value="search">인터넷 검색</option>
          <option value="sns">SNS (인스타그램, 페이스북 등)</option>
          <option value="youtube">유튜브</option>
          <option value="passingBy">지나가다가</option>
          <option value="other">기타</option>
        </select>
      </div>

      {/* 경로 상세 */}
      <div>
        <label htmlFor="sourceDetail" className="block text-sm font-medium text-foreground mb-2">
          경로 상세
        </label>
        <textarea
          id="sourceDetail"
          name="sourceDetail"
          value={formData.sourceDetail}
          onChange={handleChange}
          rows={2}
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent resize-none"
          placeholder="예: 친구 이름, 검색 키워드, SNS 계정 등"
        />
      </div>

      {/* 관심있는 사역/모임 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          관심있는 사역/모임 (여러 개 선택 가능)
        </label>
        <div className="space-y-2">
          {[
            { value: 'youngAdults', label: '청년부' },
            { value: 'worship', label: '찬양팀' },
            { value: 'bibleStudy', label: '성경공부' },
            { value: 'service', label: '봉사' },
            { value: 'prayer', label: '기도회' },
            { value: 'smallGroup', label: '소그룹' },
            { value: 'notSure', label: '아직 잘 모르겠어요' },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="interests"
                value={option.value}
                checked={formData.interests.includes(option.value)}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border text-[#C9A84C] focus:ring-[#C9A84C] focus:ring-offset-0"
              />
              <span className="text-sm text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 문의사항 또는 기도제목 */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
          문의사항 또는 기도제목
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent resize-none"
          placeholder="궁금한 점이나 기도 요청이 있으시면 자유롭게 작성해 주세요"
        />
      </div>

      {/* 개인정보 수집 동의 */}
      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="privacyConsent"
            checked={formData.privacyConsent}
            onChange={handleChange}
            className="w-4 h-4 mt-0.5 rounded border-border text-[#C9A84C] focus:ring-[#C9A84C] focus:ring-offset-0"
          />
          <div className="flex-1">
            <span className="text-sm font-medium text-foreground">
              개인정보 수집 및 이용 동의 <span className="text-red-500">*</span>
            </span>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              입력하신 정보는 새가족 환영 및 교회 안내 목적으로만 사용되며, 본인의 동의 없이
              제3자에게 제공되지 않습니다.
            </p>
          </div>
        </label>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#1B3A2D] text-white font-medium py-3 px-6 rounded-lg hover:bg-[#1B3A2D]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? '제출 중...' : '등록하기'}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        등록하시면 담당자가 연락드려 교회를 안내해 드립니다.
      </p>
    </form>
  )
}
