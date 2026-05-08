import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: '관리자 계정',
    plural: '관리자 계정',
  },
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    description: 'CMS에 로그인할 수 있는 관리자 계정을 관리합니다.',
    group: '4. 새가족/계정',
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '이름',
    },
  ],
  timestamps: true,
}
