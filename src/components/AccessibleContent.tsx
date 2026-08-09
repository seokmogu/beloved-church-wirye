import { FormattedText } from '@/components/FormattedText'

import { CopyTextButton } from './CopyTextButton'

type AccessibleContentProps = {
  content?: string | null
  summary?: string | null
}

export function AccessibleContent({ content, summary }: AccessibleContentProps) {
  const normalizedContent = content?.trim()
  const normalizedSummary = summary?.trim()
  const copyText = [normalizedSummary, normalizedContent].filter(Boolean).join('\n\n')

  if (!copyText) return null

  return (
    <section
      aria-labelledby="image-content-text-heading"
      className="border-t border-border bg-muted/15 px-5 py-8 md:px-8 md:py-10"
    >
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">ACCESSIBLE TEXT</p>
            <h2 id="image-content-text-heading" className="mt-1 text-xl font-semibold text-foreground">
              이미지 내용 텍스트
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              원본 이미지의 내용을 읽고 검색·복사할 수 있도록 정리한 텍스트입니다.
            </p>
          </div>
          <CopyTextButton text={copyText} />
        </div>

        {normalizedSummary && (
          <div className="mt-6 rounded-md border border-primary/20 bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground">이번 주 한눈에</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {normalizedSummary}
            </p>
          </div>
        )}

        {normalizedContent && (
          <FormattedText
            className="mt-7 space-y-4 text-[15px] leading-7 text-foreground"
            headingClassName="pt-2 text-lg font-semibold leading-snug text-foreground"
            itemClassName="pl-1"
            listClassName="space-y-2"
            paragraphClassName="whitespace-pre-line"
          >
            {normalizedContent}
          </FormattedText>
        )}
      </div>
    </section>
  )
}
