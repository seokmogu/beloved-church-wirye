'use client'

import type React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FormData = {
  address: string
  age: string
  baptismStatus: string
  birthDate: string
  churchRoles: string[]
  conductConsent: boolean
  faithCommunityConsent: boolean
  faithExperience: string
  gender: string
  groupChatConsent: boolean
  mbti: string
  name: string
  phone: string
  previousChurch: string
  privacyConsent: boolean
  schoolOrWork: string
  sourceChannels: string[]
  sourceDetail: string
  visitDate: string
  website: string
}

const initialFormData: FormData = {
  address: '',
  age: '',
  baptismStatus: '',
  birthDate: '',
  churchRoles: [],
  conductConsent: false,
  faithCommunityConsent: false,
  faithExperience: '',
  gender: '',
  groupChatConsent: false,
  mbti: '',
  name: '',
  phone: '',
  previousChurch: '',
  privacyConsent: false,
  schoolOrWork: '',
  sourceChannels: [],
  sourceDetail: '',
  visitDate: new Date().toISOString().split('T')[0],
  website: '',
}

const sourceOptions = [
  { value: 'referral', label: '전도/소개' },
  { value: 'sns', label: 'SNS' },
  { value: 'youtube', label: '유튜브' },
  { value: 'search', label: '인터넷 검색' },
  { value: 'other', label: '기타' },
]

const roleOptions = [
  { value: 'deacon', label: '집사' },
  { value: 'kwonsa', label: '권사' },
  { value: 'elder', label: '장로' },
  { value: 'pastor', label: '목회자' },
]

function CheckboxField({
  checked,
  label,
  name,
  onChange,
  required,
  value,
}: {
  checked: boolean
  label: string
  name: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  value?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
      <input
        checked={checked}
        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
        name={name}
        onChange={onChange}
        required={required}
        type="checkbox"
        value={value}
      />
      <span>{label}</span>
    </label>
  )
}

export function NewcomerForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target

    if (type === 'checkbox') {
      const checked = (event.target as HTMLInputElement).checked

      if (name === 'sourceChannels' || name === 'churchRoles') {
        setFormData((prev) => ({
          ...prev,
          [name]: checked ? [...prev[name], value] : prev[name].filter((item) => item !== value),
        }))
        return
      }

      setFormData((prev) => ({ ...prev, [name]: checked }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (formData.sourceChannels.length === 0) {
      setError('방문경로를 하나 이상 선택해 주세요.')
      return
    }

    if (!formData.privacyConsent) {
      setError('개인정보 사용에 동의해 주세요.')
      return
    }

    if (!formData.groupChatConsent || !formData.conductConsent || !formData.faithCommunityConsent) {
      setError('동의/서약 항목을 모두 확인해 주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newcomers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: formData.sourceChannels[0],
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '등록에 실패했습니다.')
      }

      router.push('/newcomer/thank-you')
    } catch (err) {
      console.error('Form submission error:', err)
      setError(err instanceof Error ? err.message : '등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7 rounded-xl border border-border bg-card p-6 md:p-8"
    >
      {/* Honeypot: hidden from real users; bots that fill it are silently dropped server-side. */}
      <input
        aria-hidden="true"
        autoComplete="off"
        className="hidden"
        name="website"
        onChange={handleChange}
        tabIndex={-1}
        type="text"
        value={formData.website}
      />

      <div className="border-b border-border pb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Welcome</p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">새가족 등록카드</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          등록카드에 기재된 개인정보는 교회목양 사역에만 사용됩니다.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="visitDate" className="mb-2 block text-sm font-medium text-foreground">
            등록신청일 <span className="text-red-500">*</span>
          </label>
          <input
            id="visitDate"
            name="visitDate"
            required
            type="date"
            value={formData.visitDate}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="이름을 입력해 주세요"
          />
        </div>

        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-foreground">
            성별 <span className="text-red-500">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'male', label: '남' },
              { value: 'female', label: '여' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground"
              >
                <input
                  checked={formData.gender === option.value}
                  className="h-4 w-4 border-border text-primary focus:ring-primary"
                  name="gender"
                  onChange={handleChange}
                  required
                  type="radio"
                  value={option.value}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="birthDate" className="mb-2 block text-sm font-medium text-foreground">
            생년월일
          </label>
          <div className="grid grid-cols-[1fr_88px] gap-2">
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              aria-label="나이"
              inputMode="numeric"
              name="age"
              type="text"
              value={formData.age}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="나이"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground">
            연락처 <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            required
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="010-1234-5678"
          />
        </div>

        <div>
          <label htmlFor="schoolOrWork" className="mb-2 block text-sm font-medium text-foreground">
            학교/직장
          </label>
          <input
            id="schoolOrWork"
            name="schoolOrWork"
            type="text"
            value={formData.schoolOrWork}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="학교 또는 직장"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="mb-2 block text-sm font-medium text-foreground">
            주소
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="예: 성남시 위례서일로3길 21-4"
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">방문경로</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sourceOptions.map((option) => (
            <CheckboxField
              key={option.value}
              checked={formData.sourceChannels.includes(option.value)}
              label={option.label}
              name="sourceChannels"
              onChange={handleChange}
              value={option.value}
            />
          ))}
        </div>
        <input
          aria-label="방문경로 기타 내용"
          name="sourceDetail"
          type="text"
          value={formData.sourceDetail}
          onChange={handleChange}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="기타 또는 소개자 이름을 적어주세요"
        />
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-foreground">신앙경력</legend>
          <div className="space-y-2">
            {[
              { value: 'firstTime', label: '교회가 처음' },
              { value: 'returning', label: '오래 쉬었어요' },
              { value: 'transfer', label: '교회 이동' },
            ].map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  checked={formData.faithExperience === option.value}
                  className="h-4 w-4 border-border text-primary focus:ring-primary"
                  name="faithExperience"
                  onChange={handleChange}
                  type="radio"
                  value={option.value}
                />
                {option.label}
              </label>
            ))}
          </div>
          <input
            aria-label="기존교회"
            name="previousChurch"
            type="text"
            value={formData.previousChurch}
            onChange={handleChange}
            className="mt-3 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="기존교회"
          />
        </fieldset>

        <div>
          <label htmlFor="mbti" className="mb-2 block text-sm font-medium text-foreground">
            MBTI
          </label>
          <input
            id="mbti"
            name="mbti"
            type="text"
            value={formData.mbti}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 uppercase text-foreground placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="예: ENFP"
          />

          <fieldset className="mt-5">
            <legend className="mb-2 block text-sm font-medium text-foreground">세례</legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'baptized', label: '받음' },
                { value: 'notBaptized', label: '안 받음' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                >
                  <input
                    checked={formData.baptismStatus === option.value}
                    className="h-4 w-4 border-border text-primary focus:ring-primary"
                    name="baptismStatus"
                    onChange={handleChange}
                    type="radio"
                    value={option.value}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">직분</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {roleOptions.map((option) => (
            <CheckboxField
              key={option.value}
              checked={formData.churchRoles.includes(option.value)}
              label={option.label}
              name="churchRoles"
              onChange={handleChange}
              value={option.value}
            />
          ))}
        </div>
      </fieldset>

      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="text-sm font-semibold text-foreground">동의/서약</h3>
        <CheckboxField
          checked={formData.privacyConsent}
          label="등록카드에 기재된 개인정보는 교회목양 사역에만 사용됨에 동의합니다."
          name="privacyConsent"
          onChange={handleChange}
          required
        />
        <CheckboxField
          checked={formData.groupChatConsent}
          label="교회 공지사항 및 긴급 중보기도 전달 목적의 단체카톡방 초대에 동의합니다."
          name="groupChatConsent"
          onChange={handleChange}
          required
        />
        <CheckboxField
          checked={formData.conductConsent}
          label="금품 거래와 사업 목적의 사적 연락 및 만남을 하지 않겠습니다."
          name="conductConsent"
          onChange={handleChange}
          required
        />
        <CheckboxField
          checked={formData.faithCommunityConsent}
          label="음주, 도박, 외부성경공부 권유 등 비신앙적/이단적 행위를 하지 않겠습니다."
          name="faithCommunityConsent"
          onChange={handleChange}
          required
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? '제출 중...' : '등록하기'}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        제출 후 담당자가 연락드려 교회를 안내해 드립니다.
      </p>
    </form>
  )
}
