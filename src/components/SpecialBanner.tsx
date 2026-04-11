import { getPayload } from 'payload'
import config from '@payload-config'

export async function SpecialBanner() {
  const payload = await getPayload({ config })
  const data = await payload.findGlobal({ slug: 'special-banner' })

  if (!data.enabled) return null

  const now = new Date()
  const endDate = data.endDate ? new Date(data.endDate) : null
  const startDate = data.startDate ? new Date(data.startDate) : null

  // Check date range
  if (endDate && now > endDate) return null
  if (startDate && now < startDate) return null

  return (
    <div
      className="py-2.5 px-4 text-center border-b border-amber-300/30"
      style={{
        background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
        color: '#FFFBEB',
      }}
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
        <span className="text-base sm:text-lg" aria-hidden="true">
          📢
        </span>
        <span className="font-bold text-base sm:text-lg tracking-tight">{data.text}</span>
        {data.subtext && (
          <span className="text-sm sm:text-base opacity-90">{data.subtext}</span>
        )}
      </div>
    </div>
  )
}
