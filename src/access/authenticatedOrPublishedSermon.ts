import type { Access } from 'payload'

/**
 * Access control for Sermons collection.
 * Sermons uses a custom 'status' field (not Payload's built-in _status/drafts).
 * Authenticated users can see all sermons; public users only see published ones.
 */
export const authenticatedOrPublishedSermon: Access = ({ req: { user } }) => {
  if (user) {
    return true
  }

  return {
    status: {
      equals: 'published',
    },
  }
}
