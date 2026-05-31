import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@payload-config'
import type { SiteSetting } from '@/payload-types'

export const metadata: Metadata = {
  title: '등록 완료 | 사랑하는교회',
  description: '새가족등록이 완료되었습니다.',
}

export const dynamic = 'force-dynamic'

async function getSettings(): Promise<SiteSetting | null> {
  try {
    const payload = await getPayload({ config })
    return await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  } catch (error) {
    console.error('Failed to fetch site settings:', error)
    return null
  }
}

function formatLocation(settings: SiteSetting | null): string {
  const address = settings?.address?.trim() || '위례서일로 3길 21-4'
  const addressDetail = settings?.addressDetail?.trim()
  return addressDetail ? `${address} (${addressDetail})` : address
}

export default async function ThankYouPage() {
  const settings = await getSettings()
  const services = (settings?.worshipServices ?? []).filter(
    (service) => service?.name && service?.time,
  )
  const primaryServices = services.slice(0, 3)

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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

        <h1 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">
          등록이 완료되었습니다
        </h1>
        <p className="mb-6 leading-relaxed text-muted-foreground">
          사랑하는교회에 관심을 가져주셔서 감사합니다.
          <br />
          담당자가 곧 연락드려 교회를 따뜻하게 안내해 드리겠습니다.
        </p>

        <div className="mb-8 rounded-xl border border-primary/10 bg-primary/5 p-6 text-left">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            예배안내
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {primaryServices.length > 0 ? (
              primaryServices.map((service) => (
                <li key={`${service.name}-${service.time}`} className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  <span>
                    <strong className="text-foreground">{service.name}:</strong> {service.time}
                  </span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  <span>
                    <strong className="text-foreground">주일 예배:</strong> 매주 일요일 오후 12시
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-primary">•</span>
                  <span>
                    <strong className="text-foreground">금요 예배:</strong> 매주 금요일 오후 8시
                  </span>
                </li>
              </>
            )}
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">•</span>
              <span>
                <strong className="text-foreground">위치:</strong> {formatLocation(settings)}
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="flex-1 rounded-lg bg-primary px-6 py-3 text-center font-medium text-white transition-colors hover:bg-primary/90"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/worship"
            className="flex-1 rounded-lg border-2 border-primary bg-white px-6 py-3 text-center font-medium text-primary transition-colors hover:bg-primary/5"
          >
            예배안내 보기
          </Link>
        </div>
      </div>
    </main>
  )
}
