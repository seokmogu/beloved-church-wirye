import type { Block } from 'payload'

export const GoogleDriveBlock: Block = {
  slug: 'googleDriveBlock',
  labels: { singular: '구글드라이브 파일', plural: '구글드라이브 파일' },
  fields: [
    {
      name: 'driveLink',
      type: 'text',
      required: true,
      label: '구글드라이브 링크',
    },
    { name: 'title', type: 'text', label: '제목' },
    {
      name: 'showPreview',
      type: 'checkbox',
      defaultValue: true,
      label: '미리보기 표시',
    },
  ],
}
