import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: '위례 신도시 사랑하는교회 | Like Christ — 그리스도를 본받아 함께 사랑하는 공동체',
  images: [
    {
      url: `${getServerSideURL()}/logo-beloved.png`,
    },
  ],
  siteName: '사랑하는교회 Beloved Church Wirye',
  title: '사랑하는교회 | Beloved Church Wirye',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
