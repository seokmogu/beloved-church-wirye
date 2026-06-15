type ImageRow = { caption?: string | null; id?: string | null; image?: unknown }

function imageUrl(image: unknown): string | null {
  if (image && typeof image === 'object' && 'url' in image) {
    return (image as { url?: string | null }).url ?? null
  }
  return null
}

function imageIdValue(image: unknown): string {
  if (image && typeof image === 'object' && 'id' in image) {
    const id = (image as { id?: number | string }).id
    return id == null ? '' : String(id)
  }
  return image == null ? '' : String(image)
}

/**
 * Reusable multi-image uploader for manage forms. Existing images render with a hidden
 * id input (kept on save unless 삭제 is checked); new files post via `<prefix>ImageFiles`.
 * The server action pairs with `parseExistingImageRows(formData, prefix)` +
 * `uploadMediaFilesFromForm(..., '<prefix>ImageFiles')`.
 */
export function ImageUploadFields({
  docImages,
  prefix,
  title,
}: {
  docImages?: ImageRow[] | null
  prefix: string
  title: string
}) {
  const images = docImages || []

  return (
    <div className="manage-field">
      <label htmlFor={`${prefix}ImageFiles`}>{title} (여러 장 선택 가능)</label>

      {images.length > 0 && (
        <div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '8px 0' }}
          aria-label="등록된 이미지"
        >
          {images.map((row, index) => {
            const url = imageUrl(row.image)
            return (
              <div
                key={row.id ?? index}
                style={{
                  border: '1px solid var(--manage-border, #e5e7eb)',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: 8,
                }}
              >
                <input name={`${prefix}ImageId`} type="hidden" value={imageIdValue(row.image)} />
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={row.caption ?? ''}
                    src={url}
                    style={{ borderRadius: 6, height: 96, objectFit: 'cover', width: 96 }}
                  />
                ) : (
                  <span style={{ fontSize: 12 }}>이미지</span>
                )}
                <input
                  defaultValue={row.caption ?? ''}
                  name={`${prefix}Caption-${index}`}
                  placeholder="설명 (선택)"
                  style={{ fontSize: 12, padding: '2px 4px', width: 150 }}
                  type="text"
                />
                <label className="manage-checkbox" style={{ fontSize: 12 }}>
                  <input name={`${prefix}RemoveImage-${index}`} type="checkbox" />
                  <span>삭제</span>
                </label>
              </div>
            )
          })}
        </div>
      )}

      <input
        accept="image/*"
        id={`${prefix}ImageFiles`}
        multiple
        name={`${prefix}ImageFiles`}
        type="file"
      />
    </div>
  )
}
