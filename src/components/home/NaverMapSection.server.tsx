import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NaverMapSection } from './NaverMapSection'
import type { SiteSetting } from '@/payload-types'

async function getSiteSettings() {
  try {
    const payload = await getPayload({ config: configPromise })
    return await payload.findGlobal({ slug: 'site-settings' })
  } catch {
    return null
  }
}

export async function NaverMapSectionServer({
  description,
  eyebrow,
  settings: settingsFromProps,
  title,
}: {
  description?: string | null
  eyebrow?: string | null
  settings?: SiteSetting | null
  title?: string | null
}) {
  const settings = settingsFromProps ?? (await getSiteSettings())

  return (
    <NaverMapSection
      churchName={settings?.churchName ?? '사랑하는교회'}
      address={settings?.address ?? '위례서일로 3길 21-4'}
      addressDetail={settings?.addressDetail ?? 'BELOVED LOUNGE'}
      description={description}
      eyebrow={eyebrow}
      transitInfo={settings?.transitInfo ?? '남위례역 근처, 도보 약 5분 거리'}
      title={title}
      worshipServices={settings?.worshipServices ?? []}
      lat={settings?.mapLat ?? 37.4670}
      lng={settings?.mapLng ?? 127.1395}
    />
  )
}
