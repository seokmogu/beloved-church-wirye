'use client'

import { useState } from 'react'

type FormData = {
  name: string
  phone: string
  email: string
  age: string
  familyStatus: string
  visitSource: string
  interests: string[]
  message: string
  contactConsent: boolean
}

export function NewcomerForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    age: 'not-specified',
    familyStatus: 'not-specified',
    visitSource: '',
    interests: [],
    message: '',
    contactConsent: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.contactConsent) {
      alert('연락 동의에 체크해주세요')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/newcomers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('등록에 실패했습니다')
      }

      setSubmitStatus('success')
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        age: 'not-specified',
        familyStatus: 'not-specified',
        visitSource: '',
        interests: [],
        message: '',
        contactConsent: false,
      })
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8">
      {submitStatus === 'success' ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">등록이 완료되었습니다!</h3>
          <p className="text-muted-foreground mb-6">
            새가족 담당자가 곧 연락드리겠습니다.
            <br />
            사랑하는교회에 오신 것을 진심으로 환영합니다.
          </p>
          <button
            onClick={() => setSubmitStatus('idle')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            새로 등록하기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="홍길동"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="010-1234-5678"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              이메일 <span className="text-muted-foreground text-xs">(선택)</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="example@email.com"
            />
          </div>

          {/* 연령대 */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-foreground mb-2">
              연령대
            </label>
            <select
              id="age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="not-specified">선택 안 함</option>
              <option value="20s-below">20대 이하</option>
              <option value="30s">30대</option>
              <option value="40s">40대</option>
              <option value="50s">50대</option>
              <option value="60s-above">60대 이상</option>
            </select>
          </div>

          {/* 가정 상황 */}
          <div>
            <label htmlFor="familyStatus" className="block text-sm font-medium text-foreground mb-2">
              가정 상황
            </label>
            <select
              id="familyStatus"
              value={formData.familyStatus}
              onChange={(e) => setFormData({ ...formData, familyStatus: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="not-specified">선택 안 함</option>
              <option value="single">미혼</option>
              <option value="married-no-children">기혼 (자녀 없음)</option>
              <option value="married-with-children">기혼 (자녀 있음)</option>
            </select>
          </div>

          {/* 교회를 알게 된 경로 */}
          <div>
            <label htmlFor="visitSource" className="block text-sm font-medium text-foreground mb-2">
              교회를 알게 된 경로 <span className="text-red-500">*</span>
            </label>
            <select
              id="visitSource"
              required
              value={formData.visitSource}
              onChange={(e) => setFormData({ ...formData, visitSource: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">선택해주세요</option>
              <option value="referral">지인 소개</option>
              <option value="search">인터넷 검색</option>
              <option value="social-media">소셜 미디어</option>
              <option value="neighborhood">동네에서 우연히</option>
              <option value="advertisement">전단지/광고</option>
              <option value="other">기타</option>
            </select>
          </div>

          {/* 관심 있는 사역 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              관심 있는 사역 <span className="text-muted-foreground text-xs">(복수 선택 가능)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'worship', label: '예배' },
                { value: 'bible-study', label: '성경 공부' },
                { value: 'small-group', label: '소그룹' },
                { value: 'volunteer', label: '봉사' },
                { value: 'prayer', label: '기도' },
                { value: 'praise', label: '찬양' },
                { value: 'not-sure', label: '아직 모르겠음' },
              ].map((interest) => (
                <label
                  key={interest.value}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition ${
                    formData.interests.includes(interest.value)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest.value)}
                    onChange={() => handleInterestToggle(interest.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{interest.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 하고 싶은 말 */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              하고 싶은 말 <span className="text-muted-foreground text-xs">(선택)</span>
            </label>
            <textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="자유롭게 작성해 주세요"
            />
          </div>

          {/* 연락 동의 */}
          <div className="flex items-start gap-2 p-4 bg-muted/30 border border-border rounded-lg">
            <input
              id="contactConsent"
              type="checkbox"
              required
              checked={formData.contactConsent}
              onChange={(e) => setFormData({ ...formData, contactConsent: e.target.checked })}
              className="w-5 h-5 mt-0.5"
            />
            <label htmlFor="contactConsent" className="text-sm text-foreground flex-1">
              <strong>개인정보 수집 및 연락 동의</strong>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                수집된 개인정보는 새가족 환영 및 교회 안내 목적으로만 사용되며,
                <br />
                본인의 동의 없이 제3자에게 제공되지 않습니다.
              </p>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              isSubmitting
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90'
            }`}
          >
            {isSubmitting ? '등록 중...' : '새가족 등록하기'}
          </button>

          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {errorMessage || '등록 중 오류가 발생했습니다. 다시 시도해주세요.'}
            </div>
          )}
        </form>
      )}
    </div>
  )
}
