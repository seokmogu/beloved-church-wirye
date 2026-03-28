import type { Block } from 'payload'

export const YouTubeBlock: Block = {
  slug: 'youtubeBlock',
  labels: { singular: '유튜브 영상', plural: '유튜브 영상' },
  fields: [
    {
      name: 'videoId',
      type: 'text',
      required: true,
      label: '유튜브 영상 ID',
      admin: {
        description: 'YouTube URL에서 v= 뒤의 값 (예: dQw4w9WgXcQ)',
      },
    },
    { name: 'title', type: 'text', label: '제목' },
  ],
}
