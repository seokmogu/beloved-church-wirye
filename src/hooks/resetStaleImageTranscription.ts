import type { CollectionAfterChangeHook } from 'payload'

import { imageSourcesChanged } from '@/lib/imageTranscription'

export function resetStaleImageTranscription(
  collection: 'bulletins' | 'church-news',
): CollectionAfterChangeHook {
  return async ({ context, doc, operation, previousDoc, req }) => {
    if (context.skipImageTranscription || operation !== 'update') return doc
    if (!imageSourcesChanged(doc, previousDoc)) return doc

    const accessibleContent =
      typeof doc.accessibleContent === 'object' && doc.accessibleContent ? doc.accessibleContent : {}

    await req.payload.update({
      collection,
      context: { ...context, skipImageTranscription: true },
      data: {
        accessibleContent: {
          ...accessibleContent,
          content: null,
          processedAt: null,
          seoDescription: null,
          seoTitle: null,
          sourceHash: null,
          summary: null,
        },
      },
      id: doc.id,
      req,
    })

    return doc
  }
}
