import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getManagePayload() {
  return getPayload({ config: configPromise })
}
