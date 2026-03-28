import type { Block } from 'payload'

export const InstagramBlock: Block = {
  slug: 'instagramBlock',
  labels: { singular: '인스타그램 임베드', plural: '인스타그램 임베드' },
  fields: [
    {
      name: 'embedCode',
      type: 'textarea',
      required: true,
      label: '인스타그램 임베드 코드',
      admin: {
        description: '인스타그램 게시물에서 공유 > 임베드로 복사한 코드를 붙여넣으세요',
      },
    },
  ],
}
