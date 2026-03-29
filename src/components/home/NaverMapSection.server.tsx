import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NaverMapSection } from './NaverMapSection'

async function getSiteSettings() {
  try {
    const payload = await getPayload({ config: configPromise })
    return await payload.findGlobal({ slug: 'site-settings' })
  } catch {
    return null
  }
}

export async function NaverMapSectionServer() {
  const settings = await getSiteSettings()

  return (
    <NaverMapSection
      address={settings?.address ?? '위례서일로 3길 21-4'}
      addressDetail={settings?.addressDetail ?? 'BELOVED LOUNGE'}
      transitInfo={settings?.transitInfo ?? '남위례역 근처, 도보 약 5분 거리'}
      sundayServiceTime={settings?.sundayServiceTime ?? '12:00'}
      fridayServiceTime={settings?.fridayServiceTime ?? '20:00'}
      lat={settings?.mapLat ?? 37.4697}
      lng={settings?.mapLng ?? 127.1489}
    />
  )
}
