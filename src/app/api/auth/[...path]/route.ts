import { toNextJsHandler } from 'better-auth/next-js'

import { manageAuth } from '@/lib/manage/better-auth'

export const { GET, POST } = toNextJsHandler(manageAuth)
