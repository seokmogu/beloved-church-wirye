import { getPayload } from 'payload'
import config from '@payload-config'

export async function SpecialBanner() {
  let data

  try {
    const payload = await getPayload({ config })
    data = await payload.findGlobal({ slug: 'special-banner' })
  } catch (error) {
    console.error('Failed to fetch special banner:', error)
    return null
  }

  if (!data.enabled) return null

  const now = new Date()
  const endDate = data.endDate ? new Date(data.endDate) : null
  const startDate = data.startDate ? new Date(data.startDate) : null

  // Check date range
  if (endDate && now > endDate) return null
  if (startDate && now < startDate) return null

  const bgColor = data.backgroundColor || '#1B3A2D'
  const txtColor = data.textColor || 'white'

  return (
    <div className="py-3 px-4 text-center" style={{ backgroundColor: bgColor, color: txtColor }}>
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
        <span className="font-bold text-base sm:text-lg">{data.text}</span>
        {data.subtext && (
          <span className="text-sm sm:text-base" style={{ color: txtColor, opacity: 0.85 }}>
            {data.subtext}
          </span>
        )}
      </div>
    </div>
  )
}
