import { FormattedText } from '@/components/FormattedText'
import { excludeMarkdownSections } from '@/utilities/accessibleContent'

import { CopyTextButton } from './CopyTextButton'

type AccessibleContentProps = {
  ariaLabel?: string
  content?: string | null
  excludeSections?: string[]
  summary?: string | null
}

export function AccessibleContent({
  ariaLabel = '이미지 전사 텍스트',
  content,
  excludeSections = [],
  summary,
}: AccessibleContentProps) {
  const normalizedContent = content
    ? excludeMarkdownSections(content, excludeSections)
    : undefined
  const normalizedSummary = summary?.trim()
  const copyText = [normalizedSummary, normalizedContent].filter(Boolean).join('\n\n')

  if (!copyText) return null

  return (
    <section
      aria-label={ariaLabel}
      className="border-t border-border bg-muted/15 px-5 py-8 md:px-8 md:py-10"
    >
      <div className="mx-auto max-w-3xl">
        {normalizedSummary && (
          <p className="border-l-2 border-primary/70 pl-4 text-sm leading-6 text-muted-foreground">
            {normalizedSummary}
          </p>
        )}

        {normalizedContent && (
          <FormattedText
            className={`${normalizedSummary ? 'mt-7' : ''} space-y-4 text-[15px] leading-7 text-foreground`}
            headingClassName="pt-2 text-lg font-semibold leading-snug text-foreground"
            itemClassName="pl-1"
            listClassName="space-y-2"
            paragraphClassName="whitespace-pre-line"
          >
            {normalizedContent}
          </FormattedText>
        )}

        <div className="mt-8 flex justify-end border-t border-border/80 pt-4">
          <CopyTextButton label="내용 복사" text={copyText} />
        </div>
      </div>
    </section>
  )
}
