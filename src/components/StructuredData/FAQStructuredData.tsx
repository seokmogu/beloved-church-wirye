type FAQItem = {
  answer: string
  question: string
}

type Props = {
  items: FAQItem[]
}

export function FAQStructuredData({ items }: Props) {
  if (!items.length) return null

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
      name: item.question,
    })),
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      id="worship-faq-structured-data"
      type="application/ld+json"
    />
  )
}
