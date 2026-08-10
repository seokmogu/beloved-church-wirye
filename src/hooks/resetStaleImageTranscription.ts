import type { CollectionAfterChangeHook } from 'payload'

import { dispatchImageTranscription } from '@/lib/imageTranscriptionDispatch'
import { createImageTranscriptionSource, imageSourcesChanged } from '@/lib/imageTranscription'

export function resetStaleImageTranscription(
  collection: 'bulletins' | 'church-news',
): CollectionAfterChangeHook {
  return async ({ context, doc, operation, previousDoc, req }) => {
    if (context.skipImageTranscription) return doc
    if (operation === 'update' && !imageSourcesChanged(doc, previousDoc)) return doc

    const kind = collection === 'bulletins' ? 'bulletin' : 'church-news'
    const source = createImageTranscriptionSource(kind, doc)
    if (!source) return doc

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

    await dispatchImageTranscription({
      documentId: source.documentId,
      kind: source.kind,
      sourceHash: source.sourceHash,
    })

    return doc
  }
}
