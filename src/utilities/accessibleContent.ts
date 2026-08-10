type MarkdownHeading = {
  level: number
  text: string
}

function getMarkdownHeading(line: string): MarkdownHeading | null {
  const markdownHeading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/)
  if (markdownHeading) {
    return {
      level: markdownHeading[1].length,
      text: markdownHeading[2],
    }
  }

  const boldHeading = line.match(/^\*\*(.+?)\*\*\s*$/)
  return boldHeading ? { level: 2, text: boldHeading[1] } : null
}

function normalizeHeading(value: string): string {
  return value.replace(/[\s:：]/g, '').trim().toLocaleLowerCase('ko-KR')
}

/**
 * Keep image transcription focused on page-specific information. Repeated
 * site-wide details (such as weekly service time/location) should not be
 * repeated in the public, copyable transcript.
 */
export function excludeMarkdownSections(content: string, excludedHeadings: string[]): string {
  const excluded = new Set(excludedHeadings.map(normalizeHeading))
  const result: string[] = []
  let excludedLevel: number | null = null

  for (const line of content.split('\n')) {
    const heading = getMarkdownHeading(line)

    if (excludedLevel !== null) {
      if (heading && heading.level <= excludedLevel) {
        excludedLevel = null
      } else {
        continue
      }
    }

    if (heading && excluded.has(normalizeHeading(heading.text))) {
      excludedLevel = heading.level
      continue
    }

    result.push(line)
  }

  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
