import type { Access } from 'payload'

/**
 * Access control for Sermons collection.
 * Unlike other collections that use Payload's built-in `_status` field (from versioning),
 * Sermons uses a custom `status` field. This access control checks the correct field.
 */
export const authenticatedOrSermonPublished: Access = ({ req: { user } }) => {
  if (user) {
    return true
  }

  return {
    status: {
      equals: 'published',
    },
  }
}
