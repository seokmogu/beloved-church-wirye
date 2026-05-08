import { slugField } from 'payload'
import type { Field, RowField } from 'payload'

export function formatAdminSlug(value: unknown): string {
  const valueToSlugify =
    value && typeof value === 'object' && 'valueToSlugify' in value ? value.valueToSlugify : value

  return String(valueToSlugify ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function adminSlugField(sourceField = 'title'): Field {
  return slugField({
    required: false,
    slugify: formatAdminSlug,
    useAsSlug: sourceField,
    overrides: (baseField: RowField): RowField => {
      return {
        ...baseField,
        fields: baseField.fields.map((field): Field => {
          if ('name' in field && field.name === 'slug') {
            const admin = 'admin' in field && field.admin ? field.admin : {}

            return {
              ...field,
              label: 'URL 주소',
              admin: {
                ...admin,
                description: '제목을 기준으로 자동 생성됩니다. 필요하면 직접 수정할 수 있습니다.',
              },
            } as unknown as Field
          }

          return field
        }),
      }
    },
  }) as Field
}
