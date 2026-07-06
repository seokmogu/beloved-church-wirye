import { ManageImageGallery } from './ManageImageGallery'

type ImageRow = { caption?: string | null; id?: string | null; image?: unknown }

function imageUrl(image: unknown): string | null {
  if (image && typeof image === 'object') {
    const media = image as {
      sizes?: { small?: { url?: string | null } }
      url?: string | null
    }
    return media.sizes?.small?.url || media.url || null
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
 * Reusable multi-image uploader for manage forms. Existing images render as a
 * drag-sortable gallery grid (kept on save unless 삭제 is checked); new files
 * post via `<prefix>ImageFiles`. The server action pairs with
 * `parseExistingImageRows(formData, prefix)` +
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

      <ManageImageGallery
        items={images.map((row, index) => ({
          alt: row.caption || `이미지 ${index + 1}`,
          caption: row.caption || '',
          imageId: imageIdValue(row.image),
          rowId: row.id || '',
          url: imageUrl(row.image),
        }))}
        names={{
          caption: `${prefix}Caption-{i}`,
          imageId: `${prefix}ImageId`,
          remove: `${prefix}RemoveImage-{i}`,
        }}
      />

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
