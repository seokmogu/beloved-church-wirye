import React from 'react'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { getPayload } from 'payload'
import config from '@payload-config'

type OfferingBlockProps = {
  title?: string | null
  description?: string | null
  showBankInfo?: boolean | null
  showKakaoPay?: boolean | null
  id?: string
}

export const OfferingBlockComponent: React.FC<OfferingBlockProps> = async ({
  title,
  description,
  showBankInfo = true,
  showKakaoPay = true,
}) => {
  // Fetch site settings
  const payload = await getPayload({ config })
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
  })

  const hasBankInfo =
    siteSettings?.offeringBankName ||
    siteSettings?.offeringAccountNumber ||
    siteSettings?.offeringAccountHolder

  const hasKakaoPayQr =
    showKakaoPay && siteSettings?.offeringKakaoPayQr && typeof siteSettings.offeringKakaoPayQr === 'object'

  // 표시할 내용이 없으면 렌더링하지 않음
  if (!hasBankInfo && !hasKakaoPayQr) {
    return null
  }

  return (
    <div className="my-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {title && <h3 className="mb-4 text-xl font-semibold text-primary">{title}</h3>}
      {description && <p className="mb-4 text-gray-600">{description}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        {/* 계좌 정보 */}
        {showBankInfo && hasBankInfo && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">계좌 이체</h4>
            <div className="rounded-md bg-gray-50 p-4">
              {siteSettings.offeringBankName && (
                <p className="text-sm">
                  <span className="font-medium">은행:</span> {siteSettings.offeringBankName}
                </p>
              )}
              {siteSettings.offeringAccountNumber && (
                <p className="text-sm">
                  <span className="font-medium">계좌번호:</span> {siteSettings.offeringAccountNumber}
                </p>
              )}
              {siteSettings.offeringAccountHolder && (
                <p className="text-sm">
                  <span className="font-medium">예금주:</span> {siteSettings.offeringAccountHolder}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 카카오페이 QR */}
        {hasKakaoPayQr && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">카카오페이</h4>
            <div className="rounded-md bg-gray-50 p-4 text-center">
              <Media
                resource={siteSettings.offeringKakaoPayQr}
                imgClassName="mx-auto max-w-[200px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 추가 안내 메시지 */}
      {siteSettings?.offeringNotes && (
        <div className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-900">
          {siteSettings.offeringNotes}
        </div>
      )}
    </div>
  )
}
