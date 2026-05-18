import type { Announcement } from '@/payload-types'

type RichText = NonNullable<Announcement['content']>

const emptyParagraph = {
  children: [],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  type: 'paragraph',
  version: 1,
}

export function plaintextToLexical(value: string): RichText {
  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return {
    root: {
      children: paragraphs.length
        ? paragraphs.map((paragraph) => ({
            ...emptyParagraph,
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: paragraph.replace(/\n/g, ' '),
                type: 'text',
                version: 1,
              },
            ],
          }))
        : [emptyParagraph],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

export function lexicalToPlaintext(value: unknown): string {
  if (!value || typeof value !== 'object') return ''

  const root = (value as { root?: { children?: unknown[] } }).root
  if (!root?.children?.length) return ''

  return root.children
    .map((child) => collectText(child).trim())
    .filter(Boolean)
    .join('\n\n')
}

function collectText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const typedNode = node as { children?: unknown[]; text?: unknown; type?: unknown }

  if (typeof typedNode.text === 'string') return typedNode.text
  if (!Array.isArray(typedNode.children)) return ''

  const glue = typedNode.type === 'paragraph' ? '' : ' '
  return typedNode.children.map(collectText).filter(Boolean).join(glue)
}
