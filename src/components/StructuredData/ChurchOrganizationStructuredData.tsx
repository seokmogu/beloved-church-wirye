import type { SiteSetting } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

type Props = {
  settings: SiteSetting | null
}

function isAbsoluteHttpURL(value: string | null | undefined): value is string {
  return Boolean(value && /^https:\/\//i.test(value))
}

export function ChurchOrganizationStructuredData({ settings }: Props) {
  const siteURL = getServerSideURL().replace(/\/$/, '')
  const name = settings?.churchName?.trim() || '사랑하는교회'
  const englishName = settings?.englishName?.trim() || 'Beloved Church Wirye'
  const address = [settings?.address?.trim(), settings?.addressDetail?.trim()]
    .filter(Boolean)
    .join(' ')
  const description =
    settings?.churchDescription?.trim() ||
    '사랑하는교회는 기독교대한감리회 소속으로, 위례 신도시에서 하나님의 말씀을 중심으로 모이는 공동체입니다.'
  const sameAs = [settings?.instagramUrl, settings?.youtubeChannelUrl].filter(isAbsoluteHttpURL)

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': `${siteURL}/#organization`,
        '@type': 'Organization',
        additionalType: 'https://schema.org/Church',
        alternateName: englishName,
        description,
        logo: `${siteURL}/logo-beloved.png`,
        name,
        ...(address
          ? {
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'KR',
                streetAddress: address,
              },
            }
          : {}),
        ...(settings?.denomination?.trim() ? { knowsAbout: settings.denomination.trim() } : {}),
        ...(sameAs.length ? { sameAs } : {}),
        url: siteURL,
      },
      {
        '@id': `${siteURL}/#website`,
        '@type': 'WebSite',
        inLanguage: 'ko-KR',
        name,
        publisher: { '@id': `${siteURL}/#organization` },
        url: siteURL,
      },
    ],
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      id="church-organization-structured-data"
      type="application/ld+json"
    />
  )
}
