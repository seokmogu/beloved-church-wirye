import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Media } from '@/payload-types'

type BulletinsBlockProps = {
  title?: string | null
  description?: string | null
  limit?: number | null
  id?: string
}

export async function BulletinsBlockComponent({
  title = '주보',
  description = '사랑하는교회 주보 아카이브',
  limit = 20,
}: BulletinsBlockProps) {
  let bulletins: any[] = []
  let hasError = false

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'bulletins',
      limit: limit ?? 20,
      sort: '-date',
      where: {
        isPublic: { equals: true },
      },
    })
    bulletins = result.docs
  } catch (error) {
    console.error('Failed to fetch bulletins:', error)
    hasError = true
  }

  return (
    <div>
      {(title || description) && (
        <div className="mb-8">
          {title && <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>}
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
        </div>
      )}

      {bulletins.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>{hasError ? '주보를 불러오는 중 오류가 발생했습니다.' : '등록된 주보가 없습니다.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bulletins.map((bulletin) => {
            const file = bulletin.file as Media | null
            const fileUrl = file?.url ?? null
            const isImage = file?.mimeType?.startsWith('image/')
            const isPdf = file?.mimeType === 'application/pdf'

            return (
              <div
                key={bulletin.id}
                className="group border border-border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow"
              >
                {/* Preview */}
                <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
                  {isImage && fileUrl ? (
                    <img
                      src={fileUrl}
                      alt={bulletin.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm">PDF</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
                    {bulletin.title}
                  </h3>
                  {bulletin.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {bulletin.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mb-3">
                    {new Date(bulletin.date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'Asia/Seoul',
                    })}
                  </p>
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={isPdf}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1B3A2D] hover:text-[#C9A84C] transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      {isPdf ? '다운로드' : '보기'}
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
