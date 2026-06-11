import type { ReactNode } from 'react'

type FormattedTextProps = {
  blockquoteClassName?: string
  children?: string | null
  className?: string
  headingClassName?: string
  itemClassName?: string
  linkClassName?: string
  listClassName?: string
  paragraphClassName?: string
}

type TextBlock =
  | { depth: 1 | 2 | 3; text: string; type: 'heading' }
  | { lines: string[]; type: 'blockquote' | 'paragraph' }
  | { items: string[]; type: 'ol' | 'ul' }

const defaultLinkClassName = 'font-semibold underline underline-offset-4'
const defaultListClassName = 'ml-5 list-outside space-y-1'
const defaultParagraphClassName = 'm-0'

export function FormattedText({
  blockquoteClassName,
  children,
  className,
  headingClassName,
  itemClassName,
  linkClassName = defaultLinkClassName,
  listClassName,
  paragraphClassName = defaultParagraphClassName,
}: FormattedTextProps) {
  const text = children?.trim()
  if (!text) return null

  const blocks = parseBlocks(text)

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const Heading = block.depth === 1 ? 'h2' : block.depth === 2 ? 'h3' : 'h4'
          return (
            <Heading className={headingClassName} key={`heading-${index}`}>
              {renderInline(block.text, `heading-${index}`, linkClassName)}
            </Heading>
          )
        }

        if (block.type === 'ul' || block.type === 'ol') {
          const List = block.type
          return (
            <List
              className={`${defaultListClassName} ${block.type === 'ul' ? 'list-disc' : 'list-decimal'} ${listClassName ?? ''}`.trim()}
              key={`${block.type}-${index}`}
            >
              {block.items.map((item, itemIndex) => (
                <li className={itemClassName} key={`${block.type}-${index}-${itemIndex}`}>
                  {renderInline(item, `${block.type}-${index}-${itemIndex}`, linkClassName)}
                </li>
              ))}
            </List>
          )
        }

        if (block.type === 'blockquote' || block.type === 'paragraph') {
          const content = renderLines(block.lines, `${block.type}-${index}`, linkClassName)
          if (block.type === 'blockquote') {
            return (
              <blockquote className={blockquoteClassName} key={`blockquote-${index}`}>
                {content}
              </blockquote>
            )
          }

          return (
            <p className={paragraphClassName} key={`paragraph-${index}`}>
              {content}
            </p>
          )
        }

        return null
      })}
    </div>
  )
}

function parseBlocks(value: string): TextBlock[] {
  const lines = value.replace(/\r\n?/g, '\n').split('\n')
  const blocks: TextBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      blocks.push({
        depth: heading[1].length as 1 | 2 | 3,
        text: heading[2].trim(),
        type: 'heading',
      })
      index += 1
      continue
    }

    const unordered = getUnorderedItem(trimmed)
    if (unordered) {
      const items: string[] = []
      while (index < lines.length) {
        const item = getUnorderedItem(lines[index].trim())
        if (!item) break
        items.push(item)
        index += 1
      }
      blocks.push({ items, type: 'ul' })
      continue
    }

    const ordered = getOrderedItem(trimmed)
    if (ordered) {
      const items: string[] = []
      while (index < lines.length) {
        const item = getOrderedItem(lines[index].trim())
        if (!item) break
        items.push(item)
        index += 1
      }
      blocks.push({ items, type: 'ol' })
      continue
    }

    const quote = getQuoteLine(trimmed)
    if (quote !== null) {
      const quoteLines: string[] = []
      while (index < lines.length) {
        const item = getQuoteLine(lines[index].trim())
        if (item === null) break
        quoteLines.push(item)
        index += 1
      }
      blocks.push({ lines: quoteLines, type: 'blockquote' })
      continue
    }

    const paragraphLines: string[] = []
    while (index < lines.length) {
      const current = lines[index].trim()
      if (
        !current ||
        current.match(/^(#{1,3})\s+(.+)$/) ||
        getUnorderedItem(current) ||
        getOrderedItem(current) ||
        getQuoteLine(current) !== null
      ) {
        break
      }
      paragraphLines.push(current)
      index += 1
    }
    blocks.push({ lines: paragraphLines, type: 'paragraph' })
  }

  return blocks
}

function getOrderedItem(line: string): string | null {
  const match = line.match(/^\d+[\.)]\s+(.+)$/)
  return match ? match[1].trim() : null
}

function getQuoteLine(line: string): string | null {
  const match = line.match(/^>\s?(.*)$/)
  return match ? match[1].trim() : null
}

function getUnorderedItem(line: string): string | null {
  const match = line.match(/^[-*]\s+(.+)$/)
  return match ? match[1].trim() : null
}

function renderLines(lines: string[], keyPrefix: string, linkClassName: string): ReactNode[] {
  return lines.flatMap((line, index) => {
    const nodes = renderInline(line, `${keyPrefix}-${index}`, linkClassName)
    if (index === lines.length - 1) return nodes
    return [...nodes, <br key={`${keyPrefix}-${index}-br`} />]
  })
}

function renderInline(value: string, keyPrefix: string, linkClassName: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern =
    /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(value))) {
    if (match.index > lastIndex) {
      nodes.push(value.slice(lastIndex, match.index))
    }

    const safeHref = match[3] ? getSafeHref(match[3]) : null
    if (match[2] && safeHref) {
      const isExternal = /^https?:\/\//i.test(safeHref)
      nodes.push(
        <a
          className={linkClassName}
          href={safeHref}
          key={`${keyPrefix}-link-${match.index}`}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          target={isExternal ? '_blank' : undefined}
        >
          {match[2]}
        </a>,
      )
    } else if (match[4]) {
      nodes.push(<code key={`${keyPrefix}-code-${match.index}`}>{match[4]}</code>)
    } else if (match[5] || match[6]) {
      nodes.push(<strong key={`${keyPrefix}-strong-${match.index}`}>{match[5] ?? match[6]}</strong>)
    } else if (match[7] || match[8]) {
      nodes.push(<em key={`${keyPrefix}-em-${match.index}`}>{match[7] ?? match[8]}</em>)
    } else {
      nodes.push(match[0])
    }

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < value.length) {
    nodes.push(value.slice(lastIndex))
  }

  return nodes
}

function getSafeHref(value: string): string | null {
  const href = value.trim()
  if (href.startsWith('/') && !href.startsWith('//')) return href
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href
  return null
}
