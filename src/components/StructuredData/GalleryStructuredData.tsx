type GalleryImage = {
  alt: string
  caption?: string | null
  contentUrl: string
}

type GalleryAlbum = {
  dateCreated?: string | null
  description?: string | null
  images: GalleryImage[]
  name: string
  url: string
}

function jsonForScript(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

/** 공개 앨범 목록의 의미와 각 앨범의 관계를 검색 엔진에 전달합니다. */
export function GalleryCollectionStructuredData({
  albums,
  description,
  url,
}: {
  albums: Array<Pick<GalleryAlbum, 'description' | 'images' | 'name' | 'url'>>
  description: string
  url: string
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    description,
    inLanguage: 'ko-KR',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: albums.map((album, index) => ({
        '@type': 'ListItem',
        item: {
          '@type': 'ImageGallery',
          description: album.description || undefined,
          image: album.images[0]?.contentUrl,
          name: album.name,
          url: album.url,
        },
        position: index + 1,
      })),
      numberOfItems: albums.length,
    },
    name: '사랑하는교회 위례 행사갤러리',
    url,
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: jsonForScript(structuredData) }}
      id="gallery-collection-structured-data"
      type="application/ld+json"
    />
  )
}

/** 사진·행사 맥락을 한 앨범 단위로 제공해 이미지 검색과 답변형 검색의 근거를 만듭니다. */
export function GalleryAlbumStructuredData({
  album,
  galleryURL,
}: {
  album: GalleryAlbum
  galleryURL: string
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': `${album.url}#imagegallery`,
        '@type': 'ImageGallery',
        ...(album.dateCreated ? { dateCreated: album.dateCreated } : {}),
        ...(album.description ? { description: album.description } : {}),
        associatedMedia: album.images.map((image, index) => ({
          '@type': 'ImageObject',
          ...(image.caption ? { caption: image.caption } : {}),
          contentUrl: image.contentUrl,
          name: image.alt,
          representativeOfPage: index === 0,
        })),
        inLanguage: 'ko-KR',
        isPartOf: {
          '@id': `${galleryURL}#collectionpage`,
        },
        name: album.name,
        url: album.url,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            item: galleryURL,
            name: '행사갤러리',
            position: 1,
          },
          {
            '@type': 'ListItem',
            item: album.url,
            name: album.name,
            position: 2,
          },
        ],
      },
    ],
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: jsonForScript(structuredData) }}
      id="gallery-album-structured-data"
      type="application/ld+json"
    />
  )
}
