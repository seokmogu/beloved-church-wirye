import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import type { Field, Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | 사랑하는교회` : '사랑하는교회 | Beloved Church Wirye'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

function hidePageHierarchyField(field: Field): Field {
  if ('name' in field && field.name === 'breadcrumbs') {
    const admin = 'admin' in field && field.admin ? field.admin : {}

    return {
      ...field,
      admin: {
        ...admin,
        hidden: true,
      },
    } as Field
  }

  if ('name' in field && field.name === 'parent') {
    const admin = 'admin' in field && field.admin ? field.admin : {}

    return {
      ...field,
      label: '상위 페이지',
      admin: {
        ...admin,
        description: '비워두면 최상위 페이지로 생성됩니다. 하위 페이지로 만들 때만 선택하세요.',
      },
    } as Field
  }

  return field
}

const simplifyPagesAdminPlugin: Plugin = (config) => {
  return {
    ...config,
    collections: config.collections?.map((collection) => {
      if (collection.slug !== 'pages') return collection

      return {
        ...collection,
        fields: collection.fields.map(hidePageHierarchyField),
      }
    }),
  }
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      admin: {
        description: '페이지 URL 변경 시 필요한 고급 리다이렉트 설정입니다.',
        group: '6. 고급 기능',
      },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['pages'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  simplifyPagesAdminPlugin,
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      admin: {
        description: '문의 폼 구성이 필요할 때만 사용하는 고급 설정입니다.',
        group: '6. 고급 기능',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      admin: {
        description: '폼으로 접수된 응답 목록입니다.',
        group: '6. 고급 기능',
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: {
        description: '검색 인덱스 동기화 결과입니다. 일반 콘텐츠 수정은 소식 글에서 진행합니다.',
        group: '6. 고급 기능',
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
